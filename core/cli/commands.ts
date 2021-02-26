import Factory from "../factory/Factory.ts";
import * as print from "./stdout.ts";
import { fs, path } from "../lib/deps.ts";
import { createApplication } from "./create.ts";
import { runDevServer } from "./dev.ts";
import { quietArg } from "./fns.ts";
import { cmnd } from "./constants.ts";

export const create = async function (args: string[]): Promise<void> {
  if (!cmnd.create.test(args[0])) return;

  const repo = args[1];
  if (repo) {
    const dir = `${Deno.cwd()}/${repo}`;
    await fs.ensureDir(dir);
    Deno.chdir(dir);
  }

  await createApplication(repo);
  return;
};

export const build = async function (args: string[]): Promise<void> {
  if (!cmnd.build.test(args[0])) return;

  const vno = new Factory();
  await vno.build();

  if (quietArg(args[1]) || quietArg(args[2])) print.QUIET();
  else print.ASCII();
};

export const run = async function (args: string[]): Promise<void> {
  if (!cmnd.run.test(args[0])) return;

  const vno = new Factory();
  await vno.build();

  if (quietArg(args[2]) || quietArg(args[3])) print.QUIET();
  else print.ASCII();
  const { port, hostname } = vno;

  if (cmnd.dev.test(args[1])) {
    await runDevServer(port, hostname);
    Deno.exit(0);
  } else if (cmnd.server.test(args[1])) {
    if (vno.server == null) return;
    try {
      const handler = (await import(path.resolve(vno.server)))?.default;
      await handler();
      Deno.exit(0);
    } catch (e) {
      console.error(e);
      Deno.exit(1);
    }
  }
};

