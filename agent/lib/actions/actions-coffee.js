export default {
  name: "coffee",

  init(merchant) {
    if (!merchant) {
      return this.reject("a merchant name is required");
    }

    this.state = {
      merchant: merchant,
      areas: []
    };

    return this.append();
  },

  addArea(area) {
    if (!area) {
      return this.reject("an area is required");
    }

    const parsedArea = JSON.parse(area);
    const radius = parsedArea.radius;
    if (!radius || typeof radius !== "number" || !isFinite(radius)) {
      return this.reject("a valid radius is required");
    }

    const x = parsedArea.x;
    if (!x || typeof x !== "number" || !isFinite(x)) {
      return this.reject("a valid X is required");
    }

    const y = parsedArea.y;
    if (!y || typeof y !== "number" || !isFinite(y)) {
      return this.reject("a valid Y is required");
    }

    this.state.areas.push({
      radius: radius,
      x: x,
      y: y
    });

    return this.append();
  }
};
