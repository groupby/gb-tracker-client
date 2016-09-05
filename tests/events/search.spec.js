const chai   = require('chai');
const expect = chai.expect;
const diff   = require('deep-diff').diff;

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
          search:          true,
          dym:             false,
          sayt:            false,
          recommendations: false
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
        search:          true,
        dym:             false,
        sayt:            false,
        recommendations: false
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
          search:          true,
          dym:             false,
          sayt:            false,
          recommendations: false
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
          recordEnd: 10,
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
          recordEnd: 10,
          recordStart: 5
        },
        selectedNavigation: [
          {
            name:        'refined 1',
            displayName: 'refined 1',
            or:          false,
            // refinements: [
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
          recordEnd: 10,
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
        // query:              'searchy searchface'
      }
    });
  });
});