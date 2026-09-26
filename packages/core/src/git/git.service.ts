import type { GitChangeSummary, GitService } from "@pushai/types";
import simpleGit, { type SimpleGit, type StatusResult } from "simple-git";

export function createGitService(cwd: string = process.cwd()): GitService {
  const git: SimpleGit = simpleGit(cwd);

  const isRepo = () => git.checkIsRepo();

  const init = async () => {
    await git.init();
  };

  const getCurrentBranch = async () => {
    const status = await git.status();
    return status.current ?? "HEAD";
  };

  const getStatus = async (): Promise<GitChangeSummary> => {
    const status: StatusResult = await git.status();

    return {
      changed: status.files.length,
      conflicted: status.conflicted,
      files: status.files.map((file) => file.path),
    };
  };

  const hasRemote = async (name = "origin") => {
    const remotes = await git.getRemotes();
    return remotes.some((remote) => remote.name === name);
  };

  const hasUpstream = async (branch: string) => {
    try {
      await git.raw(["rev-parse", "--abbrev-ref", `${branch}@{upstream}`]);
      return true;
    } catch {
      return false;
    }
  };

  // number of local commits not yet on the branch's upstream, or `null` if
  // the branch has no upstream configured yet (i.e. it's never been pushed)
  const getUnpushedCount = async (branch: string): Promise<number | null> => {
    if (!(await hasUpstream(branch))) {
      return null;
    }

    const output = await git.raw([
      "rev-list",
      "--count",
      `${branch}@{upstream}..${branch}`,
    ]);

    return Number.parseInt(output.trim(), 10);
  };

  const add = async (path: string | string[]) => {
    await git.add(path);
  };

  const getDiff = async (staged = true) => {
    return staged ? git.diff(["--staged"]) : git.diff();
  };

  const stageAll = async () => {
    await git.add(".");
  };

  const unstageAll = async () => {
    await git.reset();
  };

  // returns the short commit hash (e.g. "a91f2c4") so callers can display it
  const commit = async (message: string) => {
    const result = await git.commit(message);
    return result.commit.replace(/^\(root-commit\)\s*/, "").slice(0, 7);
  };

  const push = async (branch: string, remote = "origin") => {
    if (await hasUpstream(branch)) {
      await git.push(remote, branch);
      return;
    }

    await git.push(["-u", remote, branch]);
  };

  return {
    isRepo,
    init,
    getCurrentBranch,
    getStatus,
    hasRemote,
    hasUpstream,
    getUnpushedCount,
    getDiff,
    stageAll,
    unstageAll,
    add,
    commit,
    push,
  };
}
