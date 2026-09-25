import { createConfigStore } from "@pushai/core";
import { name } from "../../package.json";

export const configStore = createConfigStore({ serviceName: name });
