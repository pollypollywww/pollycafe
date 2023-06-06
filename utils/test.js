let orderId = "20230528";

let year = orderId.substring(0, 4);
let month = orderId.substring(4, 6);
let date = orderId.substring(6, 8);

let time = new Date(year, month - 1, date);
let plusthree = new Date(time.setDate(time.getDate() + 2));
let validDate = plusthree.toLocaleDateString();
console.log(validDate);
