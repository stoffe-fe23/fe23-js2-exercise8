
export default class RestApi {
    #urlBase;
    #urlSuffix;

    constructor(baseUrl, urlSuffix = ".json") {
        this.#urlBase = baseUrl;
        this.#urlSuffix = urlSuffix;
    }

    get url() {
        return this.#urlBase;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // Turn a FormData object into a json-encoded object (with multi-select and checkbox-group support)
    formdataToJson(formData) {
        var dataObject = {};

        if (formData instanceof FormData) {
            formData.forEach((value, key) => {
                // Workaround since the Firebase DB is type strict while FormData treats all form data as strings. 
                // Keep an eye on this to ensure it won't cause other problems. 
                let currValue = (!isNaN(value) ? parseInt(value) : value);
                currValue = (currValue === "true" ? true : (currValue === "false" ? false : currValue));

                if (!(key in dataObject)) {
                    dataObject[key] = currValue;
                }
                else {
                    if (!Array.isArray(dataObject[key])) {
                        dataObject[key] = [dataObject[key]];
                    }
                    dataObject[key].push(currValue);
                }
            });
        }

        return JSON.stringify(dataObject);
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // Convert specified object to JSON and submit it to the specified URL using POST method. 
    async postJson(formData, urlPath = '') {
        const url = `${this.#urlBase}${urlPath.length > 0 ? "/" + urlPath : ""}${this.#urlSuffix}`;
        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: (formData instanceof FormData ? this.formdataToJson(formData) : JSON.stringify(formData)),
        };

        let response = await fetch(url, options);
        if (!response.ok)
            throw new Error(`postJson error: ${response.status} - ${response.statusText}`);

        return await response.json();
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // Convert specified object to JSON and submit it to the specified URL using POST method. 
    async updateJson(formData, urlPath = '') {
        const url = `${this.#urlBase}${urlPath.length > 0 ? "/" + urlPath : ""}${this.#urlSuffix}`;
        const options = {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: (formData instanceof FormData ? this.formdataToJson(formData) : JSON.stringify(formData)),
        };

        let response = await fetch(url, options);
        if (!response.ok)
            throw new Error(`updateJson error: ${response.status} - ${response.statusText}`);

        return await response.json();
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // Remove data from remote source at the specified URL path
    async deleteJson(urlPath = '') {
        const url = `${this.#urlBase}${urlPath.length > 0 ? "/" + urlPath : ""}${this.#urlSuffix}`;
        const options = {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        };

        let response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`deleteJson error: ${response.status} - ${response.statusText}`);
        }
        return await response.json();
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // Fetch data from remote source URL path in JSON format
    async fetchJson(urlPath = '') {
        const url = `${this.#urlBase}${urlPath.length > 0 ? "/" + urlPath : ""}${this.#urlSuffix}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`fetchJson error: ${response.status} - ${response.statusText}`);
        }

        return await response.json();
    }
}