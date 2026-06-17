export default ({ filter, action }: any) => {
  filter("files.create", async (payload: any) => {
    console.log("[cypherscan-directus] files.create filter triggered");
    return payload;
  });

  action("files.create", async (meta: any) => {
    console.log("[cypherscan-directus] files.create action triggered", meta?.key);
  });
};