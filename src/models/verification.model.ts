import { bookshelf } from "../config/database";

export const VerificationModel = bookshelf.model("VerificationModel", {
  tableName     : "verifications",
  hasTimestamps : ['created_at', 'updated_at'],
  initialize() {
    this.on("saving", (model: any, attrs: any, options: any) => {
      if (!this.id) {
          this.set("created_at", new Date());
      }
      this.set("updated_at", new Date());
    });
  }
});
