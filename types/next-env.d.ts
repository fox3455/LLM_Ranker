/// <reference types="react" />
/// <reference types="next" />
import "next/env";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
    }
  }
}
