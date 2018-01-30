import * as fs from "fs";
import * as child from "child_process";

export default {
  name: "coffee",

  init(merchant) {
    if (!merchant) {
      return this.reject("a merchant name is required");
    }

    this.state = {
      merchant: merchant,
      areas: [],
      deliveries: []
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
  },

  sendBeans(farmerId, weight, locationProof) {
    if (!farmerId) {
      return this.reject("a farmerId is required");
    }

    if (!weight) {
      return this.reject("a valid weight is required");
    }

    if (!locationProof) {
      return this.reject("a proof of location is required");
    }

    // Create an output file claiming a valid location
    fs.writeFileSync(
      "/var/stratumn/zkp/prover_verifier_shared/proof_of_location.outputs",
      "1\n1\n"
    );

    // Write the proof to the file the verifier executable expects
    // We can make this more flexible in the future when needed
    fs.writeFileSync(
      "/var/stratumn/zkp/prover_verifier_shared/proof_of_location.proof",
      Buffer.from(locationProof, "hex")
    );

    return child.exec(
      "/var/stratumn/zkp/verify.sh",
      (error, stdout, stderr) => {
        console.log(`[zkp] verifier: ${stdout}`);

        if (error) {
          return this.reject("unauthorized farmer location");
        }

        if (!this.state.deliveries) {
          this.state.deliveries = [];
        }

        this.state.deliveries.push({
          farmer: farmerId,
          weight: weight,
          locationProof: locationProof
        });

        return this.append();
      }
    );
  }
};
