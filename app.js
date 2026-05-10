const express = require("express");
const app = express();
const path = require("path");
const method_override = require("method-override");
const mongoose = require("mongoose");
const ejs_mate = require("ejs-mate");

const { listingSchema } = require("./schema.js");
const Listing = require("./models/listing.js");
const asyncWrap = require("./utils/asyncWrap.js");
const ExpressError = require("./utils/ExpressError.js");

const port = 3000;

// ---------- MIDDLEWARE & CONFIG ----------
app.engine("ejs", ejs_mate);
app.use(method_override('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ---------- DATABASE CONNECTION ----------
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wonderlust');
}
main()
  .then(() => console.log("Database connected"))
  .catch(err => console.log(err));

// ---------- ROUTES ----------
app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.get("/listings", asyncWrap(async (req, res) => {
  const allListings = await Listing.find();
  res.render("./listings/index", { allListings });
}));

app.get("/listings/new", (req, res) => {
  res.render("./listings/new.ejs");
});

app.get("/listings/:id", asyncWrap(async (req, res) => {
  const list = await Listing.findById(req.params.id);
  if (!list) throw new ExpressError(404, "Listing not found");

  list.title = list.title || "Untitled Listing";
  list.description = list.description || "No description available";
  list.image = list.image || "https://via.placeholder.com/400x250?text=No+Image";
  list.price = list.price ?? 0;
  list.location = list.location || "Location not available";
  list.country = list.country || "Country not available";

  res.render("./listings/show.ejs", { list });
}));

app.get("/listings/:id/edit", asyncWrap(async (req, res) => {
  const list = await Listing.findById(req.params.id);
  if (!list) throw new ExpressError(404, "Listing not found");
  res.render("./listings/edit.ejs", { list });
}));

app.post("/listings", asyncWrap(async (req, res) => {
  const result = listingSchema.validate(req.body);
  if (result.error) throw new ExpressError(400, result.error.message);

  const newList = new Listing(req.body.listing);
  console.log(req.body.listing);
  await newList.save();
  res.redirect("/listings");
}));

app.patch("/listings/:id", asyncWrap(async (req, res) => {
  const { id } = req.params;
  const result = listingSchema.validate(req.body);
  if (result.error) throw new ExpressError(400, result.error.message);

  await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
  res.redirect(`/listings/${id}`);
}));

app.get("/listings/:id/delete", asyncWrap(async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  res.redirect("/listings");
}));

// ---------- ERROR HANDLING ----------
app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  res.status(status).send(message);
});

// ---------- SERVER START ----------
app.listen(port, () => {
  console.log("Server is listening to port:", port);
});
