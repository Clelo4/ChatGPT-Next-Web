import { makeAutoObservable } from "mobx";

class PromptStore {
  constructor() {
    makeAutoObservable(this);
  }

  search(inputString: string) {}
}

export default PromptStore;
