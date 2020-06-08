//jshint esversion:6
exports.getDate = () => {

const d = new Date();

const options = {
  weekday: "long",
  day: "numeric",
  month: "long"
};

return d.toLocaleDateString("fr-CH", options);
};



exports.getDay = () => {

const d = new Date();

const options = {
  weekday: "long"
};

return d.toLocaleDateString("fr-CH", options);
};
