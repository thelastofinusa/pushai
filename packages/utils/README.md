## @pushai/utils

Small runtime-agnostic helpers shared across the pushai packages: terminal
header/icon rendering (`showHeader`), Ctrl-C/prompt-cancellation handling
(`cancellation`), provider host URLs (`hosts`), package-manager detection
(`getPackageManager`), and a `sleep` helper.

```ts
import { showHeader, cancellation, hosts, getPackageManager } from "@pushai/utils";
```

### License

This project is licensed under the [MIT License](https://github.com/thelastofinusa/pushai-monorepo/blob/main/LICENSE).