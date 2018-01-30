export default {
  name: 'coffee',

  init: function(merchant) {
    if (!merchant) {
      return this.reject('a merchant name is required');
    }

    this.state = {
      merchant: merchant
    };

    return this.append();
  }
};
