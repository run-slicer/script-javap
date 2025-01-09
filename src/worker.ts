import { expose } from "comlink";

type DataSource = (name: string) => Promise<Uint8Array>;

export interface Worker {
    disassemble(name: string, source: DataSource, options: string[]): Promise<string>;
}

expose({
    async disassemble(name: string, source: DataSource, options: string[]): Promise<string> {
        const { disassemble } = await import("@run-slicer/javap");
        return disassemble(name, { source, options });
    },
} satisfies Worker);
