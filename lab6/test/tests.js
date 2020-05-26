const storage = require("../public/javascripts/storage");

var expect = require("chai").expect;

describe("myRegExp() function", function () {
    it("returns constant pattern", function () {
        expect(myRegExp([])).to.be.a('promise')
    })
});

var myRegExp = storage.checkNull;