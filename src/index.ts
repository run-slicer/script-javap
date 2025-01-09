import type { Disassembler, Script, ScriptContext } from "@run-slicer/script";
import { wrap, proxy } from "comlink";
import type { Worker as JavapWorker } from "./worker";

// bypass cross-origin limitation
const loadWorker = async (url: URL): Promise<Worker> => {
    const response = await fetch(url);
    if (!response.ok) {
        console.error(response);
        throw new Error(`Failed to fetch worker`);
    }

    const script = await response.text();

    return new Worker(URL.createObjectURL(new Blob([script], { type: "application/javascript" })), { type: "module" });
};

const worker = wrap<JavapWorker>(await loadWorker(new URL("./worker.js", import.meta.url)));

const javap: Disassembler = {
    id: "javap",
    label: "javap",
    async class(name, source) {
        const data = await source(name);
        if (!data) return "";

        return worker.disassemble(
            name,
            proxy(async (name0) => (name === name0 ? data : source(name))),
            ["-v"]
        );
    },
};

export default {
    name: "javap",
    description: "A script binding for the javap class file introspection and disassembly tool.",
    version: __SCRIPT_VERSION__,
    load(context: ScriptContext): void | Promise<void> {
        context.disasm.add(javap);
    },
    unload(context: ScriptContext): void | Promise<void> {
        context.disasm.remove(javap.id);
    },
} satisfies Script;
