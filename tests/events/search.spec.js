const chai   = require('chai');
const expect = chai.expect;
const _      = require('lodash');
const diff   = require('deep-diff').diff;
var LZString = require('lz-string/libs/lz-string.min.js');

window                = false;
document              = false;
navigator             = {};
navigator.appCodeName = 'Microsoft Internet Explorer';
navigator.userAgent   = 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; GTB7.4; InfoPath.2; SV1; .NET CLR 3.3.69573; WOW64; en-US)';

const GbTrackerCore = require('../../lib/gb-tracker-core');

describe('gb-tracker-core tests', ()=> {
  it('should accept valid search event without search id', (done) => {
    const expectedEvent = {
      search:    {
        totalRecordCount:   10,
        pageInfo:           {
          recordEnd:   10,
          recordStart: 5
        },
        selectedNavigation: [
          {
            name:        'refined 1',
            displayName: 'refined 1',
            or:          false,
            refinements: [
              {
                type:  'value',
                value: 'something',
                count: 9823
              }
            ]
          }
        ],
        origin:             {
          search:             true,
          dym:                false,
          sayt:               false,
          recommendations:    false,
          autosearch:         false,
          navigation:         false,
          collectionSwitcher: false
        },
        query:              'searchy searchface'
      },
      eventType: 'search',
      customer:  {
        id:   'testcustomer',
        area: 'area'
      },
      visit:     {
        customerData: {
          visitorId: 'visitor',
          sessionId: 'session'
        },
        generated:    {
          uri:            '',
          timezoneOffset: 240,
          localTime:      '2016-08-14T14:05:26.872Z'
        }
      }
    };

    const gbTrackerCore = new GbTrackerCore(expectedEvent.customer.id, expectedEvent.customer.area);

    gbTrackerCore.setInvalidEventCallback(() => {
      done('fail');
    });

    gbTrackerCore.__private.sendEvent = (event) => {
      if (event.eventType === 'sessionChange') {
        return;
      }

      expect(event.clientVersion.raw).to.not.be.undefined;
      expect(event.search).to.eql(expectedEvent.search);
      expect(event.eventType).to.eql(expectedEvent.eventType);
      expect(event.customer).to.eql(expectedEvent.customer);
      expect(event.visit.customerData).to.eql(expectedEvent.visit.customerData);
      expect(event.visit.generated.timezoneOffset).to.not.be.undefined;
      expect(event.visit.generated.localTime).to.not.be.undefined;
      done();
    };

    gbTrackerCore.setVisitor(expectedEvent.visit.customerData.visitorId, expectedEvent.visit.customerData.sessionId);

    gbTrackerCore.sendSearchEvent({
      search: expectedEvent.search
    });
  });

  const lowercaseAllValues = (obj) => {
    if (!_.isObject(obj)) {
      return;
    } else {
      return _.mapValues(obj, (value) => {
        if (_.isString(value)) {
          return value.toLowerCase();
        } else if (_.isObject(value)) {
          return lowercaseAllValues(value);
        } else {
          return value;
        }
      })
    }
  };

  it('should accept valid search event with records', (done) => {
    const expectedEvent = {
      search:    searchEvent.search,
      eventType: 'search',
      customer:  {
        id:   'testcustomer',
        area: 'area'
      },
      visit:     {
        customerData: {
          visitorId: 'visitor',
          sessionId: 'session'
        },
        generated:    {
          uri:            '',
          timezoneOffset: 240,
          localTime:      '2016-08-14T14:05:26.872Z'
        }
      }
    };

    expectedEvent.search.origin = {
      autosearch:         false,
      collectionSwitcher: false,
      dym:                false,
      navigation:         false,
      recommendations:    false,
      sayt:               false,
      search:             false
    };

    // const lowercaseExpectedEvent = lowercaseAllValues(expectedEvent);

    const gbTrackerCore = new GbTrackerCore(expectedEvent.customer.id, expectedEvent.customer.area);

    gbTrackerCore.setInvalidEventCallback(() => {
      done('fail');
    });

    gbTrackerCore.__private.sendEvent = (event) => {
      if (event.eventType === 'sessionChange') {
        return;
      }

      expect(event.clientVersion.raw).to.not.be.undefined;
      // the 'lowercaseAllValues' function does somewhat mangle the object,
      // but does it consistently for both cases and ensures case insensitivity on comparison
      expect(lowercaseAllValues(event.search)).to.eql(lowercaseAllValues(expectedEvent.search));
      expect(event.eventType).to.eql(expectedEvent.eventType);
      expect(event.customer).to.eql(expectedEvent.customer);
      expect(event.visit.customerData).to.eql(expectedEvent.visit.customerData);
      expect(event.visit.generated.timezoneOffset).to.not.be.undefined;
      expect(event.visit.generated.localTime).to.not.be.undefined;
      done();
    };

    gbTrackerCore.setVisitor(expectedEvent.visit.customerData.visitorId, expectedEvent.visit.customerData.sessionId);

    gbTrackerCore.sendSearchEvent({
      search: expectedEvent.search
    });
  });

  it('should partition and properly compress large search event', (done) => {
    const expectedEvent = searchEvent;

    const gbTrackerCore = new GbTrackerCore('customerId', 'specialArea');

    gbTrackerCore.setInvalidEventCallback(() => {
      done('fail');
    });

    let segmentCounter = 0;

    gbTrackerCore.__private.sendSegment = (segment) => {

      segmentCounter++;

      expect(segment.clientVersion).to.not.be.undefined;
      expect(LZString.decompressFromEncodedURIComponent(segment.segment)).to.not.eql(null);

      // 1 segment for setVisitor, 6 for search
      if (segmentCounter > 6) {
        done();
      }
    };

    gbTrackerCore.setVisitor('visitorId', 'sessionId');

    gbTrackerCore.sendSearchEvent({
      search: expectedEvent.search
    });
  });

  it('should reject invalid addToCart event that is not nested in search', (done) => {
    const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');

    gbTrackerCore.__private.sendEvent = (event) => {
      if (event.eventType === 'sessionChange') {
        return;
      }

      done('fail');
    };

    gbTrackerCore.setVisitor('visitor', 'session');

    gbTrackerCore.setInvalidEventCallback((event, error) => {
      expect(error).to.match(/search: is missing/);
      done();
    });

    gbTrackerCore.sendSearchEvent({
      totalRecordCount:   10,
      pageInfo:           {
        recordEnd:   10,
        recordStart: 5
      },
      selectedNavigation: [
        {
          name:        'refined 1',
          displayName: 'refined 1',
          or:          false,
          refinements: [
            {
              type:  'value',
              value: 'something',
              count: 9823
            }
          ]
        }
      ],
      origin:             {
        search:             true,
        dym:                false,
        sayt:               false,
        recommendations:    false,
        autosearch:         false,
        navigation:         false,
        collectionSwitcher: false
      },
      query:              'searchy searchface'
    });
  });

  it('should reject invalid addToCart event missing totalRecordCount', (done) => {
    const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');

    gbTrackerCore.__private.sendEvent = (event) => {
      if (event.eventType === 'sessionChange') {
        return;
      }

      done('fail');
    };

    gbTrackerCore.setVisitor('visitor', 'session');

    gbTrackerCore.setInvalidEventCallback((event, error) => {
      expect(error).to.match(/totalRecordCount: is missing/);
      done();
    });

    gbTrackerCore.sendSearchEvent({
      search: {
        // totalRecordCount:   10,
        pageInfo:           {
          recordEnd:   10,
          recordStart: 5
        },
        selectedNavigation: [
          {
            name:        'refined 1',
            displayName: 'refined 1',
            or:          false,
            refinements: [
              {
                type:  'value',
                value: 'something',
                count: 9823
              }
            ]
          }
        ],
        origin:             {
          search:             true,
          dym:                false,
          sayt:               false,
          recommendations:    false,
          autosearch:         false,
          navigation:         false,
          collectionSwitcher: false
        },
        query:              'searchy searchface'
      }
    });
  });

  it('should reject invalid addToCart event missing pageInfo', (done) => {
    const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');

    gbTrackerCore.__private.sendEvent = (event) => {
      if (event.eventType === 'sessionChange') {
        return;
      }

      done('fail');
    };

    gbTrackerCore.setVisitor('visitor', 'session');

    gbTrackerCore.setInvalidEventCallback((event, error) => {
      expect(error).to.match(/pageInfo: is missing/);
      done();
    });

    gbTrackerCore.sendSearchEvent({
      search: {
        totalRecordCount:   10, // pageInfo:           {
        //   recordEnd:   10,
        //   recordStart: 5
        // },
        selectedNavigation: [
          {
            name:        'refined 1',
            displayName: 'refined 1',
            or:          false,
            refinements: [
              {
                type:  'value',
                value: 'something',
                count: 9823
              }
            ]
          }
        ],
        origin:             {
          search:          true,
          dym:             false,
          sayt:            false,
          recommendations: false
        },
        query:              'searchy searchface'
      }
    });
  });

  it('should reject invalid addToCart event missing recordEnd', (done) => {
    const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');

    gbTrackerCore.__private.sendEvent = (event) => {
      if (event.eventType === 'sessionChange') {
        return;
      }

      done('fail');
    };

    gbTrackerCore.setVisitor('visitor', 'session');

    gbTrackerCore.setInvalidEventCallback((event, error) => {
      expect(error).to.match(/recordEnd: is missing/);
      done();
    });

    gbTrackerCore.sendSearchEvent({
      search: {
        totalRecordCount:   10,
        pageInfo:           {
          //   recordEnd:   10,
          recordStart: 5
        },
        selectedNavigation: [
          {
            name:        'refined 1',
            displayName: 'refined 1',
            or:          false,
            refinements: [
              {
                type:  'value',
                value: 'something',
                count: 9823
              }
            ]
          }
        ],
        origin:             {
          search:          true,
          dym:             false,
          sayt:            false,
          recommendations: false
        },
        query:              'searchy searchface'
      }
    });
  });

  it('should reject invalid addToCart event missing recordStart', (done) => {
    const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');

    gbTrackerCore.__private.sendEvent = (event) => {
      if (event.eventType === 'sessionChange') {
        return;
      }

      done('fail');
    };

    gbTrackerCore.setVisitor('visitor', 'session');

    gbTrackerCore.setInvalidEventCallback((event, error) => {
      expect(error).to.match(/recordStart: is missing/);
      done();
    });

    gbTrackerCore.sendSearchEvent({
      search: {
        totalRecordCount:   10,
        pageInfo:           {
          recordEnd: 10, // recordStart: 5
        },
        selectedNavigation: [
          {
            name:        'refined 1',
            displayName: 'refined 1',
            or:          false,
            refinements: [
              {
                type:  'value',
                value: 'something',
                count: 9823
              }
            ]
          }
        ],
        origin:             {
          search:          true,
          dym:             false,
          sayt:            false,
          recommendations: false
        },
        query:              'searchy searchface'
      }
    });
  });

  it('should reject invalid addToCart event missing selectedNavigation.name', (done) => {
    const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');

    gbTrackerCore.__private.sendEvent = (event) => {
      if (event.eventType === 'sessionChange') {
        return;
      }

      done('fail');
    };

    gbTrackerCore.setVisitor('visitor', 'session');

    gbTrackerCore.setInvalidEventCallback((event, error) => {
      expect(error).to.match(/name: is missing/);
      done();
    });

    gbTrackerCore.sendSearchEvent({
      search: {
        totalRecordCount:   10,
        pageInfo:           {
          recordEnd:   10,
          recordStart: 5
        },
        selectedNavigation: [
          {
            // name:        'refined 1',
            displayName: 'refined 1',
            or:          false,
            refinements: [
              {
                type:  'value',
                value: 'something',
                count: 9823
              }
            ]
          }
        ],
        origin:             {
          search:          true,
          dym:             false,
          sayt:            false,
          recommendations: false
        },
        query:              'searchy searchface'
      }
    });
  });

  it('should reject invalid addToCart event missing selectedNavigation.refinements', (done) => {
    const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');

    gbTrackerCore.__private.sendEvent = (event) => {
      if (event.eventType === 'sessionChange') {
        return;
      }

      done('fail');
    };

    gbTrackerCore.setVisitor('visitor', 'session');

    gbTrackerCore.setInvalidEventCallback((event, error) => {
      expect(error).to.match(/refinements: is missing/);
      done();
    });

    gbTrackerCore.sendSearchEvent({
      search: {
        totalRecordCount:   10,
        pageInfo:           {
          recordEnd:   10,
          recordStart: 5
        },
        selectedNavigation: [
          {
            name:        'refined 1',
            displayName: 'refined 1',
            or:          false, // refinements: [
            //   {
            //     type:  'value',
            //     value: 'something',
            //     count: 9823
            //   }
            // ]
          }
        ],
        origin:             {
          search:          true,
          dym:             false,
          sayt:            false,
          recommendations: false
        },
        query:              'searchy searchface'
      }
    });
  });

  it('should reject invalid addToCart event missing query', (done) => {
    const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');

    gbTrackerCore.__private.sendEvent = (event) => {
      if (event.eventType === 'sessionChange') {
        return;
      }

      done('fail');
    };

    gbTrackerCore.setVisitor('visitor', 'session');

    gbTrackerCore.setInvalidEventCallback((event, error) => {
      expect(error).to.match(/query: is missing/);
      done();
    });

    gbTrackerCore.sendSearchEvent({
      search: {
        totalRecordCount:   10,
        pageInfo:           {
          recordEnd:   10,
          recordStart: 5
        },
        selectedNavigation: [
          {
            name:        'refined 1',
            displayName: 'refined 1',
            or:          false,
            refinements: [
              {
                type:  'value',
                value: 'something',
                count: 9823
              }
            ]
          }
        ],
        origin:             {
          search:          true,
          dym:             false,
          sayt:            false,
          recommendations: false
        }, // query:              'searchy searchface'
      }
    });
  });
});

const searchEvent = {
  "search": {
    "totalRecordCount":    57048,
    "id":                  "ba1428b2dfd8ad604a84d2b6f28d56cdc403052e",
    "area":                "ProductionSemanticDemo",
    "biasingProfile":      "All_Results",
    "template":            {
      "name":  "default",
      "zones": {}
    },
    "pageInfo":            {
      "recordStart": 1,
      "recordEnd":   12
    },
    "matchStrategy":       {
      "name":  "strong match",
      "rules": [
        {
          "termsGreaterThan": 2,
          "mustMatch":        80,
          "percentage":       true
        },
        {
          "termsGreaterThan": 4,
          "mustMatch":        70,
          "percentage":       true
        },
        {
          "termsGreaterThan": 8,
          "mustMatch":        60,
          "percentage":       true
        }
      ]
    },
    "availableNavigation": [
      {
        "name":        "child.INSTOREPICKUP_INDICATOR",
        "displayName": "Pick up at myCVS®",
        "type":        "Value",
        "refinements": [
          {
            "type":  "Value",
            "count": 14397,
            "value": "Pick Up In Store"
          }
        ],
        "metadata":    [],
        "range":       false,
        "or":          false
      },
      {
        "name":        "category1",
        "displayName": "Main Category",
        "type":        "Value",
        "refinements": [
          {
            "type":  "Value",
            "count": 21459,
            "value": "Household & Grocery"
          },
          {
            "type":  "Value",
            "count": 15709,
            "value": "Beauty"
          },
          {
            "type":  "Value",
            "count": 4308,
            "value": "Home Health Care"
          },
          {
            "type":  "Value",
            "count": 3680,
            "value": "Personal Care"
          },
          {
            "type":  "Value",
            "count": 3533,
            "value": "Vitamins"
          },
          {
            "type":  "Value",
            "count": 3252,
            "value": "Health & Medicine"
          },
          {
            "type":  "Value",
            "count": 1161,
            "value": "Baby & Child"
          },
          {
            "type":  "Value",
            "count": 1147,
            "value": "Diet & Nutrition"
          },
          {
            "type":  "Value",
            "count": 412,
            "value": "Sexual Health"
          },
          {
            "type":  "Value",
            "count": 27,
            "value": "Internal Pain Relief"
          },
          {
            "type":  "Value",
            "count": 20,
            "value": "Trending Vitamins"
          },
          {
            "type":  "Value",
            "count": 13,
            "value": "Pain Patches, Rubs & Creams"
          },
          {
            "type":  "Value",
            "count": 2,
            "value": "Bath Accessories"
          },
          {
            "type":  "Value",
            "count": 2,
            "value": "Pain Relief Devices"
          },
          {
            "type":  "Value",
            "count": 1,
            "value": "Natural Pain Relief"
          }
        ],
        "metadata":    [],
        "range":       false,
        "or":          false
      },
      {
        "name":            "category2",
        "displayName":     "Category",
        "type":            "Value",
        "moreRefinements": true,
        "refinements":     [
          {
            "type":  "Value",
            "count": 9356,
            "value": "School & Office Supplies"
          },
          {
            "type":  "Value",
            "count": 4491,
            "value": "Perfume & Cologne"
          },
          {
            "type":  "Value",
            "count": 3917,
            "value": "Electronics"
          },
          {
            "type":  "Value",
            "count": 3547,
            "value": "Hair Care"
          },
          {
            "type":  "Value",
            "count": 2644,
            "value": "Other Daily Living Aids"
          },
          {
            "type":  "Value",
            "count": 2530,
            "value": "Skin Care"
          },
          {
            "type":  "Value",
            "count": 2437,
            "value": "Bath & Body"
          },
          {
            "type":  "Value",
            "count": 1669,
            "value": "Makeup"
          },
          {
            "type":  "Value",
            "count": 1585,
            "value": "Pet Supplies"
          },
          {
            "type":  "Value",
            "count": 1488,
            "value": "Food & Snacks"
          },
          {
            "type":  "Value",
            "count": 1209,
            "value": "Herbals"
          },
          {
            "type":  "Value",
            "count": 1134,
            "value": "Health Goals"
          },
          {
            "type":  "Value",
            "count": 1038,
            "value": "First Aid"
          },
          {
            "type":  "Value",
            "count": 1035,
            "value": "Beauty Tools & Accessories"
          },
          {
            "type":  "Value",
            "count": 1009,
            "value": "Candy"
          },
          {
            "type":  "Value",
            "count": 905,
            "value": "Braces & Supports"
          },
          {
            "type":  "Value",
            "count": 852,
            "value": "Toys & Games"
          },
          {
            "type":  "Value",
            "count": 824,
            "value": "Oral Care"
          },
          {
            "type":  "Value",
            "count": 740,
            "value": "Massage & Relaxation"
          },
          {
            "type":  "Value",
            "count": 614,
            "value": "Digestive Health"
          }
        ],
        "metadata":        [],
        "range":           false,
        "or":              false
      },
      {
        "name":            "category3",
        "displayName":     "Sub Category",
        "type":            "Value",
        "moreRefinements": true,
        "refinements":     [
          {
            "type":  "Value",
            "count": 4742,
            "value": "Binders & Folders"
          },
          {
            "type":  "Value",
            "count": 2843,
            "value": "Perfume for Women"
          },
          {
            "type":  "Value",
            "count": 2127,
            "value": "Face"
          },
          {
            "type":  "Value",
            "count": 1948,
            "value": "Medicine Accessories"
          },
          {
            "type":  "Value",
            "count": 1899,
            "value": "Desk Supplies"
          },
          {
            "type":  "Value",
            "count": 1757,
            "value": "Ink Cartridges"
          },
          {
            "type":  "Value",
            "count": 1661,
            "value": "Shampoo & Conditioner"
          },
          {
            "type":  "Value",
            "count": 1648,
            "value": "Cologne for Men"
          },
          {
            "type":  "Value",
            "count": 1223,
            "value": "Styling"
          },
          {
            "type":  "Value",
            "count": 1213,
            "value": "Dog Accessories"
          },
          {
            "type":  "Value",
            "count": 1100,
            "value": "Body Lotion, Oils & Sprays"
          },
          {
            "type":  "Value",
            "count": 1089,
            "value": "Other Herbals"
          },
          {
            "type":  "Value",
            "count": 999,
            "value": "Computer Supplies"
          },
          {
            "type":  "Value",
            "count": 773,
            "value": "Paper & Notebooks"
          },
          {
            "type":  "Value",
            "count": 630,
            "value": "Massage Oil & Lotion"
          },
          {
            "type":  "Value",
            "count": 611,
            "value": "Eyes"
          },
          {
            "type":  "Value",
            "count": 608,
            "value": "Accessories"
          },
          {
            "type":  "Value",
            "count": 540,
            "value": "Body Wash"
          },
          {
            "type":  "Value",
            "count": 526,
            "value": "Pens & Pencils"
          },
          {
            "type":  "Value",
            "count": 515,
            "value": "Calendars & Planners"
          }
        ],
        "metadata":        [],
        "range":           false,
        "or":              false
      },
      {
        "name":            "child.PRODUCT_BRAND",
        "displayName":     "Brand",
        "type":            "Value",
        "moreRefinements": true,
        "refinements":     [
          {
            "type":  "Value",
            "count": 2690,
            "value": "CVS/pharmacy"
          },
          {
            "type":  "Value",
            "count": 1530,
            "value": "Avery"
          },
          {
            "type":  "Value",
            "count": 747,
            "value": "Smead"
          },
          {
            "type":  "Value",
            "count": 639,
            "value": "Pet Life"
          },
          {
            "type":  "Value",
            "count": 616,
            "value": "Drive Medical"
          },
          {
            "type":  "Value",
            "count": 563,
            "value": "Hollister"
          },
          {
            "type":  "Value",
            "count": 549,
            "value": "Oshadhi"
          },
          {
            "type":  "Value",
            "count": 468,
            "value": "Sparco"
          },
          {
            "type":  "Value",
            "count": 444,
            "value": "Coloplast"
          },
          {
            "type":  "Value",
            "count": 403,
            "value": "Convatec"
          },
          {
            "type":  "Value",
            "count": 386,
            "value": "Cardinal"
          },
          {
            "type":  "Value",
            "count": 385,
            "value": "Kleer-Fax"
          },
          {
            "type":  "Value",
            "count": 384,
            "value": "Pendaflex"
          },
          {
            "type":  "Value",
            "count": 372,
            "value": "Royce Leather"
          },
          {
            "type":  "Value",
            "count": 356,
            "value": "Elite Image"
          },
          {
            "type":  "Value",
            "count": 343,
            "value": "Wilson Jones"
          },
          {
            "type":  "Value",
            "count": 336,
            "value": "L'Oreal"
          },
          {
            "type":  "Value",
            "count": 310,
            "value": "Touchdog"
          },
          {
            "type":  "Value",
            "count": 307,
            "value": "ITA-MED"
          },
          {
            "type":  "Value",
            "count": 297,
            "value": "Gabrialla"
          }
        ],
        "metadata":        [],
        "range":           false,
        "or":              true
      },
      {
        "name":        "child.REFINEMENT_GROUP_9",
        "displayName": "Primary Color",
        "type":        "Value",
        "refinements": [
          {
            "type":  "Value",
            "count": 275,
            "value": "Black"
          },
          {
            "type":  "Value",
            "count": 51,
            "value": "Blonde"
          },
          {
            "type":  "Value",
            "count": 69,
            "value": "Blue"
          },
          {
            "type":  "Value",
            "count": 4,
            "value": "Bronze"
          },
          {
            "type":  "Value",
            "count": 487,
            "value": "Brown"
          },
          {
            "type":  "Value",
            "count": 23,
            "value": "Gold"
          },
          {
            "type":  "Value",
            "count": 47,
            "value": "Green"
          },
          {
            "type":  "Value",
            "count": 4,
            "value": "Grey"
          },
          {
            "type":  "Value",
            "count": 4,
            "value": "Nude"
          },
          {
            "type":  "Value",
            "count": 46,
            "value": "Orange"
          },
          {
            "type":  "Value",
            "count": 188,
            "value": "Pink"
          },
          {
            "type":  "Value",
            "count": 95,
            "value": "Purple"
          },
          {
            "type":  "Value",
            "count": 154,
            "value": "Red"
          },
          {
            "type":  "Value",
            "count": 9,
            "value": "Silver"
          },
          {
            "type":  "Value",
            "count": 16,
            "value": "Yellow"
          }
        ],
        "metadata":    [],
        "range":       false,
        "or":          true
      },
      {
        "name":            "child.PRODUCT_SIZE",
        "displayName":     "Size",
        "type":            "Value",
        "moreRefinements": true,
        "refinements":     [
          {
            "type":  "Value",
            "count": 12323,
            "value": "1 CT"
          },
          {
            "type":  "Value",
            "count": 4643,
            "value": "1 EA"
          },
          {
            "type":  "Value",
            "count": 1675,
            "value": "25 CT"
          },
          {
            "type":  "Value",
            "count": 1501,
            "value": "3.4 OZ"
          },
          {
            "type":  "Value",
            "count": 1489,
            "value": "1 OZ"
          },
          {
            "type":  "Value",
            "count": 1326,
            "value": "10 CT"
          },
          {
            "type":  "Value",
            "count": 1258,
            "value": "100 CT"
          },
          {
            "type":  "Value",
            "count": 1159,
            "value": "4 OZ"
          },
          {
            "type":  "Value",
            "count": 1145,
            "value": "1.7 OZ"
          },
          {
            "type":  "Value",
            "count": 997,
            "value": "8 OZ"
          },
          {
            "type":  "Value",
            "count": 989,
            "value": "2 OZ"
          },
          {
            "type":  "Value",
            "count": 810,
            "value": "16 OZ"
          },
          {
            "type":  "Value",
            "count": 787,
            "value": "60 CT"
          },
          {
            "type":  "Value",
            "count": 736,
            "value": "12 CT"
          },
          {
            "type":  "Value",
            "count": 729,
            "value": "50 CT"
          },
          {
            "type":  "Value",
            "count": 722,
            "value": "5 CT"
          },
          {
            "type":  "Value",
            "count": 637,
            "value": ".5 OZ"
          },
          {
            "type":  "Value",
            "count": 625,
            "value": "2.5 OZ"
          },
          {
            "type":  "Value",
            "count": 564,
            "value": "12 OZ"
          },
          {
            "type":  "Value",
            "count": 561,
            "value": "6 OZ"
          }
        ],
        "metadata":        [],
        "range":           false,
        "or":              true
      },
      {
        "name":        "child.PRODUCT_PRICE",
        "displayName": "Price",
        "type":        "Range",
        "refinements": [
          {
            "type":  "Range",
            "count": 6445,
            "high":  "5",
            "low":   "0"
          },
          {
            "type":  "Range",
            "count": 10549,
            "high":  "10",
            "low":   "5"
          },
          {
            "type":  "Range",
            "count": 7406,
            "high":  "15",
            "low":   "10"
          },
          {
            "type":  "Range",
            "count": 6768,
            "high":  "20",
            "low":   "15"
          },
          {
            "type":  "Range",
            "count": 4391,
            "high":  "25",
            "low":   "20"
          },
          {
            "type":  "Range",
            "count": 22752,
            "high":  "10000",
            "low":   "25"
          }
        ],
        "metadata":    [],
        "range":       true,
        "or":          false
      },
      {
        "name":        "gbietl_product_rating_buckets",
        "displayName": "Reviews",
        "type":        "Value",
        "refinements": [
          {
            "type":  "Value",
            "count": 7545,
            "value": "1"
          },
          {
            "type":  "Value",
            "count": 7199,
            "value": "2"
          },
          {
            "type":  "Value",
            "count": 6837,
            "value": "3"
          },
          {
            "type":  "Value",
            "count": 5871,
            "value": "4"
          }
        ],
        "metadata":    [],
        "range":       false,
        "or":          false
      },
      {
        "name":        "child.gbietl_semantic_tags",
        "displayName": "Semantic Tags",
        "type":        "Value",
        "refinements": [
          {
            "type":  "Value",
            "count": 118,
            "value": "easy to swallow"
          }
        ],
        "metadata":    [],
        "range":       false,
        "or":          false
      },
      {
        "name":        "child.gbietl_sku_active_ingredients",
        "displayName": "Active Ingredients",
        "type":        "Value",
        "refinements": [
          {
            "type":  "Value",
            "count": 743,
            "value": "yellow 6"
          },
          {
            "type":  "Value",
            "count": 204,
            "value": "acetaminophen"
          },
          {
            "type":  "Value",
            "count": 154,
            "value": "phenylephrine"
          },
          {
            "type":  "Value",
            "count": 101,
            "value": "diphenhydramine"
          },
          {
            "type":  "Value",
            "count": 93,
            "value": "guaifenesin"
          },
          {
            "type":  "Value",
            "count": 57,
            "value": "ibuprofen"
          },
          {
            "type":  "Value",
            "count": 55,
            "value": "aspirin"
          }
        ],
        "metadata":    [],
        "range":       false,
        "or":          false
      }
    ],
    "selectedNavigation":  [],
    "records":             [
      {
        "collection": "products2",
        "allMeta":    {
          "category2":                     "Oral Care",
          "category3":                     "Toothpaste",
          "gbietl_product_rating_buckets": [],
          "category1":                     "Personal Care",
          "title":                         "CVS Travel Toothbrush With Colgate Toothpaste",
          "child":                         [
            {
              "CUSTOMER_PRICE":          "1.99",
              "PRODUCT_BRAND":           "CVS/pharmacy",
              "UNIT_PRICE_MEASAMT":      "1",
              "PRODCUT_AVAILABILITY":    "Available",
              "id":                      "234381",
              "PRODUCT_SIZE":            "1 EA",
              "PRODUCT_SHORTNAME":       "CVS Travel Toothbrush With Colgate Toothpaste",
              "PRODUCT_UPCNUMBER":       "5042804753",
              "DEFAULT_SKU_IMAGE":       "m667511",
              "PRODUCT_SUBCATEGORYNAME": "Toothpaste"
            }
          ]
        },
        "_id":        "01715b58c5a82069eb1cf72e6e7a8f3d",
        "_u":         "http://gbipoccvspilot1products2.com/234381",
        "_t":         "CVS Travel Toothbrush With Colgate Toothpaste"
      },
      {
        "collection": "products2",
        "allMeta":    {
          "category2":                     "Oral Care",
          "category3":                     "Toothpaste",
          "gbietl_product_rating_buckets": [
            1
          ],
          "category1":                     "Personal Care",
          "title":                         "CVS Sensitive Toothpaste With Fluoride Extra Whitening",
          "child":                         [
            {
              "CUSTOMER_PRICE":              "4.99",
              "gbietl_sku_rating_rounded_0": 1,
              "PRODCUT_AVAILABILITY":        "Available",
              "PRODUCT_SIZE":                "4 OZ",
              "PRODUCT_SHORTNAME":           "CVS Sensitive Toothpaste With Fluoride Extra Whitening",
              "PRODUCT_REVIEW":              "1",
              "PRODUCT_RATING":              "1",
              "PRODUCT_BRAND":               "CVS/pharmacy",
              "UNIT_PRICE_MEASAMT":          "4",
              "id":                          "307117",
              "PRODUCT_UPCNUMBER":           "5042807070",
              "DEFAULT_SKU_IMAGE":           "m654956",
              "PRODUCT_SUBCATEGORYNAME":     "Toothpaste"
            }
          ]
        },
        "_id":        "e58d0a46807a30e1521f0ba3cd184138",
        "_u":         "http://gbipoccvspilot1products2.com/307117",
        "_t":         "CVS Sensitive Toothpaste With Fluoride Extra Whitening"
      },
      {
        "collection": "products2",
        "allMeta":    {
          "category2":                     "Oral Care",
          "category3":                     "Toothpaste",
          "gbietl_product_rating_buckets": [
            1,
            2,
            3
          ],
          "category1":                     "Personal Care",
          "title":                         "CVS Maximum Strength Sensitive Toothpaste with Fluoride, Fresh Mint",
          "child":                         [
            {
              "CUSTOMER_PRICE":              "4.99",
              "gbietl_sku_rating_rounded_0": 3,
              "PRODCUT_AVAILABILITY":        "Available",
              "PRODUCT_SIZE":                "4 OZ",
              "PRODUCT_SHORTNAME":           "CVS Maximum Strength Sensitive Toothpaste with Fluoride, Fresh Mint",
              "PRODUCT_REVIEW":              "3",
              "PRODUCT_RATING":              "3.3333",
              "PRODUCT_BRAND":               "CVS/pharmacy",
              "UNIT_PRICE_MEASAMT":          "4",
              "id":                          "307118",
              "PRODUCT_UPCNUMBER":           "5042807071",
              "DEFAULT_SKU_IMAGE":           "m654959",
              "PRODUCT_SUBCATEGORYNAME":     "Toothpaste"
            }
          ]
        },
        "_id":        "dfbdab08437bc562ffc32a7ab098ac34",
        "_u":         "http://gbipoccvspilot1products2.com/307118",
        "_t":         "CVS Maximum Strength Sensitive Toothpaste with Fluoride, Fresh Mint"
      },
      {
        "collection": "products2",
        "allMeta":    {
          "category2":                     "Oral Care",
          "category3":                     "Toothpaste",
          "gbietl_product_rating_buckets": [
            1,
            2,
            3,
            4
          ],
          "category1":                     "Personal Care",
          "title":                         "CVS Enamel Guard Toothpaste for Sensitive Teeth",
          "child":                         [
            {
              "CUSTOMER_PRICE":              "4.99",
              "gbietl_sku_rating_rounded_0": 5,
              "PRODCUT_AVAILABILITY":        "Available",
              "PRODUCT_SIZE":                "4 OZ",
              "PRODUCT_SHORTNAME":           "CVS Enamel Guard Toothpaste for Sensitive Teeth",
              "PRODUCT_REVIEW":              "1",
              "PRODUCT_RATING":              "5",
              "PRODUCT_BRAND":               "CVS/pharmacy",
              "UNIT_PRICE_MEASAMT":          "4",
              "id":                          "469084",
              "PRODUCT_UPCNUMBER":           "5042813564",
              "DEFAULT_SKU_IMAGE":           "m1100276",
              "PRODUCT_SUBCATEGORYNAME":     "Toothpaste"
            }
          ]
        },
        "_id":        "be0a0d57285af0ac6d44e2ef2481f6be",
        "_u":         "http://gbipoccvspilot1products2.com/469084",
        "_t":         "CVS Enamel Guard Toothpaste for Sensitive Teeth"
      },
      {
        "collection": "products2",
        "allMeta":    {
          "category2":                     "Oral Care",
          "category3":                     "Toothpaste",
          "gbietl_product_rating_buckets": [
            1,
            2,
            3,
            4
          ],
          "category1":                     "Personal Care",
          "title":                         "CVS Health HD Xtreme White Fluoride Anti-Cavity Whitening Toothpaste, Cool Mint",
          "child":                         [
            {
              "CUSTOMER_PRICE":              "3.69",
              "gbietl_sku_rating_rounded_0": 4,
              "PRODCUT_AVAILABILITY":        "Available",
              "PRODUCT_SIZE":                "5.8 OZ",
              "PRODUCT_SHORTNAME":           "CVS Health HD Xtreme White Fluoride Anti-Cavity Whitening Toothpaste, Cool Mint",
              "PRODUCT_REVIEW":              "3",
              "PRODUCT_RATING":              "4.6667",
              "PRODUCT_BRAND":               "CVS/pharmacy",
              "UNIT_PRICE_MEASAMT":          "5.8",
              "id":                          "897731",
              "PRODUCT_UPCNUMBER":           "5042845585",
              "DEFAULT_SKU_IMAGE":           "m2680035",
              "PRODUCT_SUBCATEGORYNAME":     "Toothpaste"
            }
          ]
        },
        "_id":        "cc3736fee1a0d0cd2db084c97109a5aa",
        "_u":         "http://gbipoccvspilot1products2.com/897731",
        "_t":         "CVS Health HD Xtreme White Fluoride Anti-Cavity Whitening Toothpaste, Cool Mint"
      },
      {
        "collection": "products2",
        "allMeta":    {
          "category2":                     "Oral Care",
          "category3":                     "Toothpaste",
          "gbietl_product_rating_buckets": [
            1,
            2,
            3,
            4
          ],
          "category1":                     "Personal Care",
          "title":                         "CVS Enamel Guard Daily Anti-Cavity Toothpaste with Fluoride, Alpine Mint",
          "child":                         [
            {
              "CUSTOMER_PRICE":              "4.99",
              "gbietl_sku_rating_rounded_0": 5,
              "PRODCUT_AVAILABILITY":        "Available",
              "PRODUCT_SIZE":                "4 OZ",
              "PRODUCT_SHORTNAME":           "CVS Enamel Guard Daily Anti-Cavity Toothpaste with Fluoride, Alpine Mint",
              "PRODUCT_REVIEW":              "1",
              "PRODUCT_RATING":              "5",
              "PRODUCT_BRAND":               "CVS/pharmacy",
              "UNIT_PRICE_MEASAMT":          "4",
              "id":                          "897738",
              "PRODUCT_UPCNUMBER":           "5042845716",
              "DEFAULT_SKU_IMAGE":           "m2680013",
              "PRODUCT_SUBCATEGORYNAME":     "Toothpaste"
            }
          ]
        },
        "_id":        "f7c02374431a00695d14cdb7e49577e6",
        "_u":         "http://gbipoccvspilot1products2.com/897738",
        "_t":         "CVS Enamel Guard Daily Anti-Cavity Toothpaste with Fluoride, Alpine Mint"
      },
      {
        "collection": "products2",
        "allMeta":    {
          "category2":                     "Oral Care",
          "category3":                     "Toothpaste",
          "gbietl_product_rating_buckets": [],
          "category1":                     "Personal Care",
          "title":                         "CVS Reflective White Anticavity + Whitening Power Toothpaste, Dazzling Mint",
          "child":                         [
            {
              "CUSTOMER_PRICE":          "3.59",
              "PRODUCT_BRAND":           "CVS/pharmacy",
              "UNIT_PRICE_MEASAMT":      "4",
              "PRODCUT_AVAILABILITY":    "Available",
              "id":                      "909057",
              "PRODUCT_SIZE":            "4 OZ",
              "PRODUCT_SHORTNAME":       "CVS Reflective White Anticavity + Whitening Power Toothpaste, Dazzling Mint",
              "PRODUCT_UPCNUMBER":       "5042845708",
              "DEFAULT_SKU_IMAGE":       "m2950419",
              "PRODUCT_SUBCATEGORYNAME": "Toothpaste"
            }
          ]
        },
        "_id":        "cfb7c606b9c9e8ee1a191fc11c4c4c80",
        "_u":         "http://gbipoccvspilot1products2.com/909057",
        "_t":         "CVS Reflective White Anticavity + Whitening Power Toothpaste, Dazzling Mint"
      },
      {
        "collection": "products2",
        "allMeta":    {
          "category2":                     "Oral Care",
          "category3":                     "Toothpaste",
          "gbietl_product_rating_buckets": [
            1,
            2,
            3
          ],
          "category1":                     "Personal Care",
          "title":                         "CVS Interdental Brushes",
          "child":                         [
            {
              "CUSTOMER_PRICE":              "4.99",
              "gbietl_sku_rating_rounded_0": 3,
              "PRODCUT_AVAILABILITY":        "Available",
              "PRODUCT_SIZE":                "16 EA",
              "PRODUCT_SHORTNAME":           "CVS Interdental Brushes",
              "PRODUCT_REVIEW":              "2",
              "PRODUCT_RATING":              "3.5",
              "PRODUCT_BRAND":               "CVS/pharmacy",
              "UNIT_PRICE_MEASAMT":          "16",
              "id":                          "933823",
              "PRODUCT_UPCNUMBER":           "5042846393",
              "DEFAULT_SKU_IMAGE":           "m3640199",
              "PRODUCT_SUBCATEGORYNAME":     "Toothpaste"
            }
          ]
        },
        "_id":        "8512e75372e3c272fa38941ed7ab6734",
        "_u":         "http://gbipoccvspilot1products2.com/933823",
        "_t":         "CVS Interdental Brushes"
      },
      {
        "collection": "products2",
        "allMeta":    {
          "category2":                     "Oral Care",
          "category3":                     "Toothpaste",
          "gbietl_product_rating_buckets": [],
          "category1":                     "Personal Care",
          "title":                         "CVS Health Repair and Protect Toothpaste, 3.4 OZ",
          "child":                         [
            {
              "CUSTOMER_PRICE":          "4.99",
              "PRODUCT_BRAND":           "CVS/pharmacy",
              "UNIT_PRICE_MEASAMT":      "3.4",
              "PRODCUT_AVAILABILITY":    "Available",
              "id":                      "571448",
              "PRODUCT_SIZE":            "3.4 OZ",
              "PRODUCT_SHORTNAME":       "CVS Health Repair and Protect Toothpaste, 3.4 OZ",
              "PRODUCT_UPCNUMBER":       "5042853549",
              "DEFAULT_SKU_IMAGE":       "m5381431",
              "PRODUCT_SUBCATEGORYNAME": "Toothpaste"
            }
          ]
        },
        "_id":        "fc499908d2d1802269ad0ec1c705ad9f",
        "_u":         "http://gbipoccvspilot1products2.com/1090042",
        "_t":         "CVS Health Repair and Protect Toothpaste, 3.4 OZ"
      },
      {
        "collection": "products2",
        "allMeta":    {
          "category2":                     "Oral Care",
          "category3":                     "Toothpaste",
          "gbietl_product_rating_buckets": [],
          "category1":                     "Personal Care",
          "title":                         "CVS Health Gentle Dry Mouth Anticavity Toothpaste with Fluoride Fresh Mint, 4.3 OZ",
          "child":                         [
            {
              "CUSTOMER_PRICE":          "6.99",
              "PRODUCT_BRAND":           "CVS/pharmacy",
              "UNIT_PRICE_MEASAMT":      "4.3",
              "PRODCUT_AVAILABILITY":    "Available",
              "id":                      "571463",
              "PRODUCT_SIZE":            "4.3 OZ",
              "PRODUCT_SHORTNAME":       "CVS Health Gentle Dry Mouth Anticavity Toothpaste with Fluoride Fresh Mint, 4.3 OZ",
              "PRODUCT_UPCNUMBER":       "5042853488",
              "DEFAULT_SKU_IMAGE":       "m5381425",
              "PRODUCT_SUBCATEGORYNAME": "Toothpaste"
            }
          ]
        },
        "_id":        "0ba64947b8023c519f567301627302b9",
        "_u":         "http://gbipoccvspilot1products2.com/1090043",
        "_t":         "CVS Health Gentle Dry Mouth Anticavity Toothpaste with Fluoride Fresh Mint, 4.3 OZ"
      },
      {
        "collection": "products2",
        "allMeta":    {
          "category2":                     "Oral Care",
          "category3":                     "Toothpaste",
          "gbietl_product_rating_buckets": [],
          "category1":                     "Personal Care",
          "title":                         "CVS Health Sensitive Enamel Guard Daily Anti-Cavity Toothpaste With Fluoride, 2CT",
          "child":                         [
            {
              "CUSTOMER_PRICE":          "8.99",
              "PRODUCT_BRAND":           "CVS/pharmacy",
              "UNIT_PRICE_MEASAMT":      "8.0",
              "PRODCUT_AVAILABILITY":    "Available",
              "id":                      "903500",
              "PRODUCT_SIZE":            "2 CT",
              "PRODUCT_SHORTNAME":       "CVS Health Sensitive Enamel Guard Daily Anti-Cavity Toothpaste With Fluoride, 2CT",
              "PRODUCT_UPCNUMBER":       "5042853705",
              "DEFAULT_SKU_IMAGE":       "m5425045",
              "PRODUCT_SUBCATEGORYNAME": "Toothpaste"
            }
          ]
        },
        "_id":        "539fb4c0a28d3044a48305ec0a4fec79",
        "_u":         "http://gbipoccvspilot1products2.com/1090372",
        "_t":         "CVS Health Sensitive Enamel Guard Daily Anti-Cavity Toothpaste With Fluoride, 2CT"
      },
      {
        "collection": "products2",
        "allMeta":    {
          "category2":                     "Oral Care",
          "category3":                     "Toothpaste",
          "gbietl_product_rating_buckets": [],
          "category1":                     "Personal Care",
          "title":                         "CVS Health Maximum Strength Sensitive Toothpaste With Fluoride, 2CT",
          "child":                         [
            {
              "CUSTOMER_PRICE":          "8.99",
              "PRODUCT_BRAND":           "CVS/pharmacy",
              "UNIT_PRICE_MEASAMT":      "8.0",
              "PRODCUT_AVAILABILITY":    "Available",
              "id":                      "903468",
              "PRODUCT_SIZE":            "2 CT",
              "PRODUCT_SHORTNAME":       "CVS Health Maximum Strength Sensitive Toothpaste With Fluoride, 2CT",
              "PRODUCT_UPCNUMBER":       "5042853583",
              "DEFAULT_SKU_IMAGE":       "m5425049",
              "PRODUCT_SUBCATEGORYNAME": "Toothpaste"
            }
          ]
        },
        "_id":        "a0d029ee713442be98b56e6b82ba8916",
        "_u":         "http://gbipoccvspilot1products2.com/1090401",
        "_t":         "CVS Health Maximum Strength Sensitive Toothpaste With Fluoride, 2CT"
      }
    ],
    "didYouMean":          [],
    "siteParams":          [],
    "originalRequest":     {
      "collection": "products2",
      "area":       "ProductionSemanticDemo",
      "query":      "",
      "skip":       0,
      "pageSize":   12,
      "sort":       [
        {
          "field": "_relevance",
          "order": "Descending"
        }
      ],
      "fields":     [
        "child.CUSTOMER_PRICE",
        "child.PRODUCT_SHORTNAME",
        "title",
        "child.DEFAULT_SKU_IMAGE",
        "child.PRODUCT_RATING",
        "child.PRODUCT_REVIEW",
        "child.PRODUCT_UPCNUMBER",
        "child.PRODUCT_SIZE",
        "child.PRODCUT_AVAILABILITY",
        "child.SKUCOMPOSITEATTR",
        "category1",
        "category2",
        "category3",
        "child.REFINEMENT_GROUP_9",
        "child.PRODUCT_BRAND",
        "child.id",
        "child.gbietl_sku_rating_rounded_0",
        "gbietl_product_rating_buckets",
        "child.UNIT_PRICE_MEASAMT",
        "child.PRODUCT_SUBCATEGORYNAME"
      ]
    },
    "relatedQueries":      [],
    "rewrites":            [],
    "origin":              {},
    "query":               "something"
  }
};