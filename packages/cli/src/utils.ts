import Conf from "conf";
import path from "path";
import os from "os";

const config = new Conf({
  projectName: "pushai",
  configName: "auth",
  cwd: path.join(os.homedir(), ".pushai"),
});

export const setToken = (token: string) => {
  config.set("token", token);
};

export const getToken = () => {
  return config.get("token") as string | undefined;
};

export const clearToken = () => {
  config.delete("token");
};

export const setUser = (user: any) => {
  config.set("user", user);
};

export const getUser = () => {
  return config.get("user") as any | undefined;
};

export const clearUser = () => {
  config.delete("user");
};

export const clearAuth = () => {
  config.clear();
};
