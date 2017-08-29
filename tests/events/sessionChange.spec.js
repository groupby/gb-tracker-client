/*eslint  no-global-assign: "off"*/

window                = false;
document              = false;
navigator             = {};
navigator.appCodeName = 'Microsoft Internet Explorer';
navigator.userAgent   = 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; GTB7.4; InfoPath.2; SV1; .NET CLR 3.3.69573; WOW64; en-US)';

const GbTracker = require('../../lib/gb-tracker-core');

describe('sessionChange tests', () => {
  it('should ignore event', (done) => {
    const gbTracker = new GbTracker('someCustomer', 'someArea');

    gbTracker.setInvalidEventCallback(() => {
      done('fail');
    });

    gbTracker.__private.sendEvent = () => {
      done('should not send');
    };

    gbTracker.setVisitor('visitId', 'sessionId');

    gbTracker.__private.sendSessionChangeEvent({
      'session': {
        'previousSessionId': '7223092d-11d4-41a1-a633-6d2a5128fa19',
        'newSessionId': 'b226bbe9-81ce-4caa-b961-ea936f771055',
        'previousVisitorId': 'ae919451-79d7-4052-89e1-d73c81b046b4',
        'newVisitorId': '3467b2d0-0ba3-4135-90b2-eeff20d0d371'
      }
    });

    // Allow time for it to fail
    setTimeout(() => done(), 100);
  });
});