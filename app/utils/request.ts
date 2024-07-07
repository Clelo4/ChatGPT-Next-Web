export class ApiError extends Error {
  errCode: number;

  constructor(message: string, errCode: number) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.errCode = errCode;
    this.stack = new Error().stack;
  }
}

export async function jsonPost<T>(url: string, params = {}): Promise<T> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params || {}),
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Redirect to a specific URL for 401 status
        window.location.href = "/login"; // Replace with your specific redirect URL
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const res = await response.json();

    // Check if there's an errCode field
    if (res.errCode !== undefined) {
      if (res.errCode !== 0) {
        throw new ApiError(res.message, res.errCode);
      }
      return res.data; // Return data if errCode is 0
    } else {
      throw new Error("Invalid JSON format! Missing errCode.");
    }
  } catch (error) {
    console.error("Error in customFetch:", error);
    throw error; // Rethrow the error to be handled by caller
  }
}
