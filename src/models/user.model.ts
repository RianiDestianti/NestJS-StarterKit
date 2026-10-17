import { bookshelf } from "../config/database";
import { RoleModel } from "./role.model";

export const UserModel = bookshelf.model("UserModel", {
  tableName     : "users",
  hasTimestamps : ['created_at', 'updated_at'],
  softDelete    : true,
  hidden        : ['password'],
  initialize() {
    this.on("saving", (model: any, attrs: any, options: any) => {
      if (!this.id) {
          this.set("created_at", new Date());
      }
      this.set("updated_at", new Date());
    });
  },
  role() {
    return this.belongsTo(RoleModel, 'role_id')
  }
});
