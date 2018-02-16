#!/bin/sh

# This script runs the prover part of the proof of location.
# The verifier needs to check that the output file is valid and needs to verify
# that the output file contains a 1 in the first line.

echo X=?
read X

echo Y=?
read Y

echo "#!/bin/sh" > bin/exo0
echo "echo $X" >> bin/exo0
echo "echo $Y" >> bin/exo0
chmod +x bin/exo0

bin/pepper_prover_proof_of_location prove proof_of_location.pkey proof_of_location.inputs proof_of_location.outputs proof_of_location.proof

# Output the content of the outputs file.
echo "* Computation output:"
cat prover_verifier_shared/proof_of_location.outputs

# Output the proof bytes.
echo "* Proof hex bytes:"
hexdump -e '16/1 "%02x " "\n"' prover_verifier_shared/proof_of_location.proof | tr -d " \r\n"