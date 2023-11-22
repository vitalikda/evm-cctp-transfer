type Attestation = {
  attestation: string;
  status: string;
};

export const getAttestation = async (
  messageHash: string,
): Promise<Attestation | undefined> => {
  try {
    const response = await fetch(
      `https://iris-api-sandbox.circle.com/attestations/${messageHash}`,
    );
    if (response.status === 404) throw new Error("Attestation not found"); // Ignore 404 error

    return response.json();
  } catch (error) {
    console.error(error);
    return;
  }
};
