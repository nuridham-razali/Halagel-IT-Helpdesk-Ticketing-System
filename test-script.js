const url = "https://script.google.com/macros/s/AKfycbzZyv2cjuzKGsw-KKP6FC_yS2-FqtzKLgXL2tz10cZx7i9WkoX_JtjA1M8F7HzCtVPt/exec";
const data = {
  action: "append",
  sheetName: "Tickets",
  data: ["TKT-9999","Test from AI","Just making sure emails work","Hardware","High","Open","Kazuya","kazuya.takumi17@gmail.com","2023-01-01","2023-01-01","","","","IT"],
  adminEmail: "kazuya.takumi17@gmail.com"
};

fetch(url, {
  method: "POST",
  headers: { "Content-Type": "text/plain;charset=utf-8" },
  body: JSON.stringify(data)
})
  .then(res => res.text())
  .then(console.log)
  .catch(console.error);
