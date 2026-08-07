const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have name'],
      unique: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have more or equal than 10 characters'],  
      // validate: [validator.isAlpha, 'Tour name must only contain characters'], // never allows spaces in the name, so we will not use it
    },
    duration: {
      type: Number,
      required: [true, 'A Tour must have duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A Tour must have maxGroupSize'],
    },
    difficulty: {
      type: String,
      required: [true, 'A Tour must have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, // e.g. 4.66666, 46.6666, 47, 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          console.log(val, this.price, val < this.price);
          // this only points to current doc on NEW document creation
          return val < this.price; // priceDiscount should be less than price
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have summary'],
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val.length > 0; // summary should not be empty
        },
        message: 'A tour must have summary',
      },
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      trim: true,
      required: [true, 'A tour must have cover image'],
    },
    images: [String],
    CreatedDate: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    slug: String,
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create() but not on .insertMany() or .update()
tourSchema.pre('save', function () {
  this.slug = slugify(this.name, { lower: true });
});

// tourSchema.pre('save', function (next) { // document middleware to run before .save() and .create()
//   console.log('Will save document...');
//   next();
// });

// tourSchema.post('save', function (doc, next) { // document middleware to run after .save() and .create()
//   console.log(doc); // doc is the document that was just saved
//   next();
// });

/**Query Middleware */

// QUERY MIDDLEWARE: runs before .find() and .findOne()
tourSchema.pre(/^find/, function () {
  // to run this middleware on all query methods that start with 'find' (find, findOne, findById, etc.)
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
});

tourSchema.post(/^find/, function (docs, next) {
  // to run this middleware on all query methods that start with 'find' (find, findOne, findById, etc.)
  console.log(`Query took ${Date.now() - this.start} milliseconds`); // docs is the array of documents that were found
  next();
});

// Aggregation Middleware
tourSchema.pre('aggregate', function () {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); // to run this middleware on all aggregation pipelines, and add a $match stage to the beginning of the pipeline to filter out secret tours
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
