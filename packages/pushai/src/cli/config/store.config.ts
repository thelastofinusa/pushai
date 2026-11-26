import { createConfigStore } from "@/core";
import { pkgConfig } from "./config.config";

export const configStore = createConfigStore({ serviceName: pkgConfig.name });
