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

  addArea(radius, x, y) {
    if (!radius || parseInt(radius) === NaN) {
      return this.reject("a valid radius is required");
    }

    if (!x || parseInt(x) === NaN) {
      return this.reject("a valid X is required");
    }

    if (!y || parseInt(y) === NaN) {
      return this.reject("a valid Y is required");
    }

    this.state.areas.push({
      radius: radius,
      x: x,
      y: y
    });

    // Update the inputs file accordingly
    const areaCount = this.state.areas.length;
    let contents = new Array(3 * areaCount);
    for (var i = 0; i < areaCount; i++) {
      const area = this.state.areas[i];
      contents[i] = area.radius;
      contents[areaCount + i] = area.x;
      contents[2 * areaCount + i] = area.y;
    }

    fs.writeFileSync(
      "/var/stratumn/zkp/prover_verifier_shared/proof_of_location.inputs",
      contents.join("\n")
    );

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
          console.log("Inputs:");
          console.log(
            fs.readFileSync(
              "/var/stratumn/zkp/prover_verifier_shared/proof_of_location.inputs",
              "ascii"
            )
          );
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
