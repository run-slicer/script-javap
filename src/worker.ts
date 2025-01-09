import { expose } from "comlink";
import { disassemble } from "@run-slicer/javap";

type DataSource = (name: string) => Promise<Uint8Array>;

export interface Worker {
    disassemble(name: string, source: DataSource, options: string[]): Promise<string>;
}

expose({
    async disassemble(name: string, source: DataSource, options: string[]): Promise<string> {
        return disassemble(name, { source, options });
    },
} satisfies Worker);
