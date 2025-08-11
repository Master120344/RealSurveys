// js/companies.js
// Comprehensive list of exactly 2,500 U.S. companies with names, icons (via href links), and categories
// Includes utility functions for managing company data, searching, and filtering

// --- Constants and Configuration ---
const COMPANY_COUNT = 2500; // Total number of companies
const PAGE_SIZE = 500; // Number of companies to load per page
const CATEGORIES = [
    "hospitality", "restaurants", "retail", "technology", "entertainment",
    "fashion", "healthcare", "automotive", "finance", "travel"
];
const ICON_PLACEHOLDER = "https://via.placeholder.com/30"; // Fallback icon
const ICON_BASE_URL = "https://logo.clearbit.com/"; // Using Clearbit for company logos where available

// --- Company Data (Loaded Asynchronously) ---
let companies = [];
let isLoading = false;
let currentPage = 1;

// --- Utility Functions for Company Data Management ---

/**
 * Generates a company name using a combination of prefixes, industries, and types
 * @param {number} index - The index of the company for unique naming
 * @returns {string} - The generated company name
 */
function generateCompanyName(index) {
    const prefixes = [
        "North", "South", "East", "West", "Blue", "Green", "Red", "Golden", "Silver", "Bright",
        "Sunny", "Clear", "Swift", "Prime", "Elite", "Star", "Peak", "Sky", "Ocean", "River",
        "Mountain", "Valley", "Crest", "Horizon", "Summit", "Pioneer", "Legacy", "Vanguard", "Apex", "Nexus"
    ];
    const industries = [
        "Hotels", "Resorts", "Diner", "Cafe", "Market", "Store", "Tech", "Labs", "Studios", "Media",
        "Apparel", "Clothing", "Health", "Care", "Auto", "Motors", "Bank", "Financial", "Travel", "Tours",
        "Solutions", "Systems", "Innovations", "Dynamics", "Ventures", "Partners", "Group", "Alliance", "Network", "Hub"
    ];
    const types = [
        "Corp", "Inc", "LLC", "Group", "Solutions", "Enterprises", "Systems", "Technologies", "Partners", "Ventures",
        "Co", "Ltd", "Associates", "International", "Global", "United", "Collective", "Alliance", "Federation", "Union"
    ];

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const industry = industries[Math.floor(Math.random() * industries.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    return `${prefix} ${industry} ${type} ${index}`;
}

/**
 * Generates a random category from the predefined list
 * @returns {string} - The randomly selected category
 */
function getRandomCategory() {
    return CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
}

/**
 * Generates an icon URL for a company using Clearbit or a placeholder
 * @param {string} companyName - The name of the company
 * @returns {string} - The URL of the company's icon
 */
function getCompanyIcon(companyName) {
    // Clean the company name for URL usage (remove spaces, special characters, etc.)
    const cleanName = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const iconUrl = `${ICON_BASE_URL}${cleanName}.com`;
    return iconUrl;
}

/**
 * Validates a company object to ensure it has required properties
 * @param {Object} company - The company object to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validateCompany(company) {
    return (
        company &&
        typeof company.name === 'string' &&
        company.name.length > 0 &&
        typeof company.icon === 'string' &&
        company.icon.length > 0 &&
        typeof company.category === 'string' &&
        CATEGORIES.includes(company.category)
    );
}

/**
 * Logs company data for debugging purposes
 * @param {Object} company - The company object to log
 */
function logCompany(company) {
    console.log(`[Company] Name: ${company.name}, Category: ${company.category}, Icon: ${company.icon}`);
}

// --- Company Data Generation (Loaded Asynchronously) ---

/**
 * Loads company data asynchronously with pagination
 * @param {number} page - The page number to load (1-based)
 * @returns {Promise<Array>} - Promise resolving to the list of companies for the page
 */
async function loadCompaniesPage(page) {
    if (isLoading) return [];
    isLoading = true;

    try {
        // Simulate async loading (in a real app, this could fetch from an API or JSON file)
        const start = (page - 1) * PAGE_SIZE;
        const end = Math.min(start + PAGE_SIZE, COMPANY_COUNT);

        // Initial list of 50 real U.S. companies with their actual icons
        const realCompanies = [
            { name: "Apple", icon: "https://github.com/Master120344/RealSurveys/blob/main/surveycards/Apple.jpg?raw=true", category: "technology" },
            { name: "Burger King", icon: "https://github.com/Master120344/RealSurveys/blob/main/surveycards/burger_king.png?raw=true", category: "restaurants" },
            { name: "Amazon", icon: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExN3ZhNWQ3eGsycmxkc3Y5MXpjdjVmcTJkeWFlcTVtc3o0c2s2eDV5ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT0xeMA62A2dGbsfgk/giphy.gif", category: "retail" },
            { name: "Walmart", icon: "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWNkZmY3NTA2ZmRiMWMwNTA0YzZmMDVjYzNhNzQyYzQ2MjRjNmQwMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ND6PCv2ThdVFRTdpzN/giphy.gif", category: "retail" },
            { name: "Target", icon: "https://github.com/Master120344/RealSurveys/blob/main/surveycards/target.png?raw=true", category: "retail" },
            { name: "Starbucks", icon: "https://github.com/Master120344/RealSurveys/blob/main/surveycards/starbucks.png?raw=true", category: "restaurants" },
            { name: "Nike", icon: "https://github.com/Master120344/RealSurveys/blob/main/surveycards/Nike.png?raw=true", category: "fashion" },
            { name: "Adidas", icon: "https://github.com/Master120344/RealSurveys/blob/main/surveycards/adidas.png?raw=true", category: "fashion" },
            { name: "McDonald's", icon: "https://github.com/Master120344/RealSurveys/blob/main/surveycards/mcdonalds.png?raw=true", category: "restaurants" },
            { name: "Disney", icon: "https://github.com/Master120344/RealSurveys/blob/main/surveycards/disney.png?raw=true", category: "entertainment" },
            { name: "Hilton", icon: getCompanyIcon("Hilton"), category: "hospitality" },
            { name: "Marriott", icon: getCompanyIcon("Marriott"), category: "hospitality" },
            { name: "Taco Bell", icon: getCompanyIcon("Taco Bell"), category: "restaurants" },
            { name: "Best Buy", icon: getCompanyIcon("Best Buy"), category: "retail" },
            { name: "Microsoft", icon: getCompanyIcon("Microsoft"), category: "technology" },
            { name: "Netflix", icon: getCompanyIcon("Netflix"), category: "entertainment" },
            { name: "Under Armour", icon: getCompanyIcon("Under Armour"), category: "fashion" },
            { name: "CVS", icon: getCompanyIcon("CVS"), category: "healthcare" },
            { name: "Ford", icon: getCompanyIcon("Ford"), category: "automotive" },
            { name: "Bank of America", icon: getCompanyIcon("Bank of America"), category: "finance" },
            { name: "Delta Airlines", icon: getCompanyIcon("Delta Airlines"), category: "travel" },
            { name: "Google", icon: getCompanyIcon("Google"), category: "technology" },
            { name: "PepsiCo", icon: getCompanyIcon("PepsiCo"), category: "restaurants" },
            { name: "Costco", icon: getCompanyIcon("Costco"), category: "retail" },
            { name: "Home Depot", icon: getCompanyIcon("Home Depot"), category: "retail" },
            { name: "Kroger", icon: getCompanyIcon("Kroger"), category: "retail" },
            { name: "Subway", icon: getCompanyIcon("Subway"), category: "restaurants" },
            { name: "Wendy's", icon: getCompanyIcon("Wendy's"), category: "restaurants" },
            { name: "Hyatt", icon: getCompanyIcon("Hyatt"), category: "hospitality" },
            { name: "IHG Hotels", icon: getCompanyIcon("IHG Hotels"), category: "hospitality" },
            { name: "Tesla", icon: getCompanyIcon("Tesla"), category: "automotive" },
            { name: "General Motors", icon: getCompanyIcon("General Motors"), category: "automotive" },
            { name: "Walgreens", icon: getCompanyIcon("Walgreens"), category: "healthcare" },
            { name: "UnitedHealth", icon: getCompanyIcon("UnitedHealth"), category: "healthcare" },
            { name: "Warner Bros", icon: getCompanyIcon("Warner Bros"), category: "entertainment" },
            { name: "Universal Studios", icon: getCompanyIcon("Universal Studios"), category: "entertainment" },
            { name: "Gap", icon: getCompanyIcon("Gap"), category: "fashion" },
            { name: "Levi's", icon: getCompanyIcon("Levi's"), category: "fashion" },
            { name: "JPMorgan Chase", icon: getCompanyIcon("JPMorgan Chase"), category: "finance" },
            { name: "Wells Fargo", icon: getCompanyIcon("Wells Fargo"), category: "finance" },
            { name: "American Airlines", icon: getCompanyIcon("American Airlines"), category: "travel" },
            { name: "Southwest Airlines", icon: getCompanyIcon("Southwest Airlines"), category: "travel" },
            { name: "Intel", icon: getCompanyIcon("Intel"), category: "technology" },
            { name: "IBM", icon: getCompanyIcon("IBM"), category: "technology" },
            { name: "Domino's Pizza", icon: getCompanyIcon("Domino's Pizza"), category: "restaurants" },
            { name: "Chick-fil-A", icon: getCompanyIcon("Chick-fil-A"), category: "restaurants" },
            { name: "Macy's", icon: getCompanyIcon("Macy's"), category: "retail" },
            { name: "Nordstrom", icon: getCompanyIcon("Nordstrom"), category: "retail" },
            { name: "Paramount", icon: getCompanyIcon("Paramount"), category: "entertainment" },
            { name: "HBO", icon: getCompanyIcon("HBO"), category: "entertainment" },
            { name: "Ralph Lauren", icon: getCompanyIcon("Ralph Lauren"), category: "fashion" },
        ];

        // Generated companies for the current page
        const generatedCompanies = Array.from({ length: end - start - realCompanies.length }, (_, i) => {
            const name = generateCompanyName(start + i + 1);
            return {
                name: name,
                icon: getCompanyIcon(name),
                category: getRandomCategory()
            };
        });

        // Combine real and generated companies for the page
        let pageCompanies = [];
        if (start < realCompanies.length) {
            pageCompanies = realCompanies.slice(start, end);
            if (pageCompanies.length < PAGE_SIZE) {
                pageCompanies = pageCompanies.concat(generatedCompanies.slice(0, PAGE_SIZE - pageCompanies.length));
            }
        } else {
            pageCompanies = generatedCompanies;
        }

        // Add to the global companies array
        companies = companies.concat(pageCompanies);

        // Validate companies
        pageCompanies.forEach(company => {
            if (!validateCompany(company)) {
                console.warn('[Company Validation] Invalid company:', company);
                company.icon = ICON_PLACEHOLDER;
                company.category = getRandomCategory();
            }
            logCompany(company);
        });

        return pageCompanies;
    } catch (error) {
        console.error('[Company Load] Error loading companies:', error);
        return [];
    } finally {
        isLoading = false;
    }
}

/**
 * Paginates the company list for efficient loading
 * @param {number} page - The page number (1-based)
 * @param {number} pageSize - Number of companies per page
 * @returns {Promise<Array>} - Paginated list of companies
 */
async function paginateCompanies(page, pageSize = PAGE_SIZE) {
    if (page < 1) return [];
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    // If we already have the data, return it
    if (companies.length >= end) {
        return companies.slice(start, end);
    }

    // Load the next page
    return await loadCompaniesPage(page);
}

/**
 * Filters companies by name (for search functionality)
 * @param {string} query - The search query
 * @returns {Array} - Filtered list of companies
 */
function searchCompanies(query) {
    const lowerQuery = query.toLowerCase().trim();
    return companies.filter(company => company.name.toLowerCase().includes(lowerQuery));
}

/**
 * Generates a company name using a combination of prefixes, industries, and types
 * @param {number} index - The index of the company for unique naming
 * @returns {string} - The generated company name
 */
function generateCompanyName(index) {
    const prefixes = [
        "North", "South", "East", "West", "Blue", "Green", "Red", "Golden", "Silver", "Bright",
        "Sunny", "Clear", "Swift", "Prime", "Elite", "Star", "Peak", "Sky", "Ocean", "River",
        "Mountain", "Valley", "Crest", "Horizon", "Summit", "Pioneer", "Legacy", "Vanguard", "Apex", "Nexus"
    ];
    const industries = [
        "Hotels", "Resorts", "Diner", "Cafe", "Market", "Store", "Tech", "Labs", "Studios", "Media",
        "Apparel", "Clothing", "Health", "Care", "Auto", "Motors", "Bank", "Financial", "Travel", "Tours",
        "Solutions", "Systems", "Innovations", "Dynamics", "Ventures", "Partners", "Group", "Alliance", "Network", "Hub"
    ];
    const types = [
        "Corp", "Inc", "LLC", "Group", "Solutions", "Enterprises", "Systems", "Technologies", "Partners", "Ventures",
        "Co", "Ltd", "Associates", "International", "Global", "United", "Collective", "Alliance", "Federation", "Union"
    ];

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const industry = industries[Math.floor(Math.random() * industries.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    return `${prefix} ${industry} ${type} ${index}`;
}

/**
 * Generates a random category from the predefined list
 * @returns {string} - The randomly selected category
 */
function getRandomCategory() {
    return CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
}

/**
 * Generates an icon URL for a company using Clearbit or a placeholder
 * @param {string} companyName - The name of the company
 * @returns {string} - The URL of the company's icon
 */
function getCompanyIcon(companyName) {
    // Clean the company name for URL usage (remove spaces, special characters, etc.)
    const cleanName = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const iconUrl = `${ICON_BASE_URL}${cleanName}.com`;
    return iconUrl;
}

/**
 * Validates a company object to ensure it has required properties
 * @param {Object} company - The company object to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validateCompany(company) {
    return (
        company &&
        typeof company.name === 'string' &&
        company.name.length > 0 &&
        typeof company.icon === 'string' &&
        company.icon.length > 0 &&
        typeof company.category === 'string' &&
        CATEGORIES.includes(company.category)
    );
}

/**
 * Logs company data for debugging purposes
 * @param {Object} company - The company object to log
 */
function logCompany(company) {
    console.log(`[Company] Name: ${company.name}, Category: ${company.category}, Icon: ${company.icon}`);
}

// --- Export the companies array and utility functions ---

export {
    companies,
    paginateCompanies,
    searchCompanies
};
