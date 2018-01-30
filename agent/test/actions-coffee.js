import Agent from '@indigoframework/agent';
import actions from '../lib/actions/actions-coffee';

describe('coffee-transitions', () => {
  // Transform our actions into a process before every test
  let map;
  beforeEach(() => {
    map = Agent.processify(actions);
  });

  describe('#init()', () => {
    it('sets the state correctly', () => {
      return map.init('amazon').then(link => {
        link.state.merchant.should.be.exactly('amazon');
      });
    });

    it('requires a merchant name', () => {
      return map
        .init()
        .then(link => {
          throw new Error('link should not have been created');
        })
        .catch(err => {
          err.message.should.be.exactly('a merchant name is required');
        });
    });
  });
});
