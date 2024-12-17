export const userSchema = {
  type: "object",
  properties: {
    login: {
      type: "string",
      minLength: 3,
      "pattern": "^[a-zA-Zа-яА-ЯёЁіїєґІЇЄҐ0-9]+$" // Допустимі літери (російські, українські та латинські) і цифри
    },
    password: {
      type: "string",
      minLength: 3,
      pattern: "^[a-zA-Zа-яА-ЯёЁіїєґІЇЄҐ0-9]+$" // Допустимі літери (російські, українські та латинські) і цифри
    }
  },
  required: ["login", "password"]
};
