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
        totalRecordCount:    10,
        pageInfo:            {
          recordEnd:   10,
          recordStart: 5
        },
        selectedRefinements: [
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
        origin:              {
          search: true,
          dym:    false,
          sayt:   false,
          wisdom: false
        },
        searchTerm:          'searchy searchface'
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

  it('should reject invalid addToCart event', (done) => {
    const gbTrackerCore = new GbTrackerCore('testcustomer', 'area');

    gbTrackerCore.__private.sendEvent = (event) => {
      if (event.eventType === 'sessionChange') {
        return;
      }

      done('fail');
    };

    gbTrackerCore.setVisitor('visitor', 'session');

    const sendNotNested = () => {
      gbTrackerCore.setInvalidEventCallback((event, error) => {
        expect(error).to.match(/search: is missing/);
        sendNoTotalRecordCount();
      });

      gbTrackerCore.sendSearchEvent({
        totalRecordCount:    10,
        pageInfo:            {
          recordEnd:   10,
          recordStart: 5
        },
        selectedRefinements: [
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
        origin:              {
          search: true,
          dym:    false,
          sayt:   false,
          wisdom: false
        },
        searchTerm:          'searchy searchface'
      });
    };

    const sendNoTotalRecordCount = () => {
      gbTrackerCore.setInvalidEventCallback((event, error) => {
        expect(error).to.match(/search\.totalRecordCount: is missing/);
        sendNoPageInfo();
      });

      gbTrackerCore.sendSearchEvent({
        search: {
          // totalRecordCount:    10,
          pageInfo:            {
            recordEnd:   10,
            recordStart: 5
          },
          selectedRefinements: [
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
          origin:              {
            search: true,
            dym:    false,
            sayt:   false,
            wisdom: false
          },
          searchTerm:          'searchy searchface'
        }
      });
    };

    const sendNoPageInfo = () => {
      gbTrackerCore.setInvalidEventCallback((event, error) => {
        expect(error).to.match(/search\.pageInfo: is missing/);
        sendNoRecordEnd()
      });

      gbTrackerCore.sendSearchEvent({
        search: {
          totalRecordCount:    10,
          // pageInfo:            {
          //   recordEnd:   10,
          //   recordStart: 5
          // },
          selectedRefinements: [
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
          origin:              {
            search: true,
            dym:    false,
            sayt:   false,
            wisdom: false
          },
          searchTerm:          'searchy searchface'
        }
      });
    };

    const sendNoRecordEnd = () => {
      gbTrackerCore.setInvalidEventCallback((event, error) => {
        expect(error).to.match(/search\.pageInfo\.recordEnd: is missing/);
        sendNoRecordStart();
      });

      gbTrackerCore.sendSearchEvent({
        search: {
          totalRecordCount:    10,
          pageInfo:            {
          //   recordEnd:   10,
            recordStart: 5
          },
          selectedRefinements: [
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
          origin:              {
            search: true,
            dym:    false,
            sayt:   false,
            wisdom: false
          },
          searchTerm:          'searchy searchface'
        }
      });
    };

    const sendNoRecordStart = () => {
      gbTrackerCore.setInvalidEventCallback((event, error) => {
        expect(error).to.match(/search\.pageInfo\.recordStart: is missing/);
        sendNoSeletedRefinements();
      });

      gbTrackerCore.sendSearchEvent({
        search: {
          totalRecordCount:    10,
          pageInfo:            {
              recordEnd:   10,
            // recordStart: 5
          },
          selectedRefinements: [
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
          origin:              {
            search: true,
            dym:    false,
            sayt:   false,
            wisdom: false
          },
          searchTerm:          'searchy searchface'
        }
      });
    };

    const sendNoSeletedRefinements = () => {
      gbTrackerCore.setInvalidEventCallback((event, error) => {
        expect(error).to.match(/search\.selectedRefinements: is missing/);
        sendNoDisplayName();
      });

      gbTrackerCore.sendSearchEvent({
        search: {
          totalRecordCount:    10,
          pageInfo:            {
            recordEnd:   10,
            recordStart: 5
          },
          // selectedRefinements: [
          //   {
          //     name:        'refined 1',
          //     displayName: 'refined 1',
          //     or:          false,
          //     refinements: [
          //       {
          //         type:  'value',
          //         value: 'something',
          //         count: 9823
          //       }
          //     ]
          //   }
          // ],
          origin:              {
            search: true,
            dym:    false,
            sayt:   false,
            wisdom: false
          },
          searchTerm:          'searchy searchface'
        }
      });
    };

    const sendNoDisplayName = () => {
      gbTrackerCore.setInvalidEventCallback((event, error) => {
        expect(error).to.match(/search\.selectedRefinements\[0].displayName: is missing/);
        sendNoRefinements();
      });

      gbTrackerCore.sendSearchEvent({
        search: {
          totalRecordCount:    10,
          pageInfo:            {
            recordEnd:   10,
            recordStart: 5
          },
          selectedRefinements: [
            {
              name:        'refined 1',
              // displayName: 'refined 1',
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
          origin:              {
            search: true,
            dym:    false,
            sayt:   false,
            wisdom: false
          },
          searchTerm:          'searchy searchface'
        }
      });
    };

    const sendNoRefinements = () => {
      gbTrackerCore.setInvalidEventCallback((event, error) => {
        expect(error).to.match(/search\.selectedRefinements\[0].refinements: is missing/);
        sendNoSearchTerm();
      });

      gbTrackerCore.sendSearchEvent({
        search: {
          totalRecordCount:    10,
          pageInfo:            {
            recordEnd:   10,
            recordStart: 5
          },
          selectedRefinements: [
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
          origin:              {
            search: true,
            dym:    false,
            sayt:   false,
            wisdom: false
          },
          searchTerm:          'searchy searchface'
        }
      });
    };


    const sendNoSearchTerm = () => {
      gbTrackerCore.setInvalidEventCallback((event, error) => {
        expect(error).to.match(/search\.searchTerm: is missing/);
        done();
      });

      gbTrackerCore.sendSearchEvent({
        search: {
          totalRecordCount:    10,
          pageInfo:            {
            recordEnd:   10,
            recordStart: 5
          },
          selectedRefinements: [
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
          origin:              {
            search: true,
            dym:    false,
            sayt:   false,
            wisdom: false
          },
          // searchTerm:          'searchy searchface'
        }
      });
    };

    sendNotNested();
  });
});