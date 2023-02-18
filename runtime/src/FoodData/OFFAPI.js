const express = require('express');
const off = require('openfoodfacts-nodejs');
const {OFFExtended} = require('./OpenFoodDataEXT');
const clientEXT = new OFFExtended();
const client = new off();
const router = express.Router();

module.exports = router

router.get('/hello', (req, res, next) => {
    var test = req.query.mojparam;
    res.send("Hello world: " + test);
});

router.get('/searchProducts', async (req, res, next) => {
    var word = req.query.word;
    var pageSize = req.query.page_size;
    var page = req.query.page;
    var onlyComplete = req.query.only_complete;
    var fields = req.query.fields;

    fields = fields ? fields : '_id,completeness,code,categories_tags,product_name,product_name_en,categories_hierarchy,category_properties,image_front_url,image_url,states_tags';

    console.log("INFO1: ", onlyComplete === 'true');

    var product = await clientEXT.getProducts(word, fields, (pageSize && page) ? {currentPage: page, step: pageSize} : undefined, undefined, onlyComplete === 'true');
    res.status(200).send(product);
});

router.get('/product', async (req, res, next) => {
    var ean = req.query.ean;
    var productJson = await client.getProduct(ean)
    res.status(200).send(productJson);
});