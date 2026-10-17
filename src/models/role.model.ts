import { bookshelf } from "../config/database";

export const RoleModel = bookshelf.model("RoleModel", {
  tableName     : "roles",
  hasTimestamps : ['created_at', 'updated_at'],
  softDelete    : true,
  initialize() {
    this.on("saving", (model: any, attrs: any, options: any) => {
      if (!this.id) {
          this.set("created_at", new Date());
      }
      this.set("updated_at", new Date());
    });
  }
});
