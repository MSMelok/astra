// Global variables
let teamData = [];
let selectedMemberId = null;
let commandHistory = [];
let historyIndex = -1;

// Terminal settings
const settings = {
    theme: 'default',
    fontSize: 14,
    lineNumbers: false,
    animations: true,
    currentLineNumber: 1
};

// Theme definitions
const themes = {
    'default': '',
    'matrix': 'theme-matrix',
    'hacker': 'theme-hacker',
    'retro': 'theme-retro',
    'neon': 'theme-neon',
    'dark': 'theme-dark'
};

// DOM Elements
const searchInput = document.getElementById('search-input');
const suggestionsDropdown = document.getElementById('suggestions-dropdown');
const contactDetails = document.getElementById('contact-details');
const loadingMessage = document.getElementById('loading-message');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const noResults = document.getElementById('no-results');
const placeholderMessage = document.getElementById('placeholder-message');
const terminalOutput = document.querySelector('.terminal-output');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements for theme customization
    const themeSelect = document.getElementById('theme-select');
    const fontSmaller = document.getElementById('font-smaller');
    const fontReset = document.getElementById('font-reset');
    const fontLarger = document.getElementById('font-larger');
    const toggleLineNumbers = document.getElementById('toggle-line-numbers');
    const toggleAnimations = document.getElementById('toggle-animations');
    const timestampElement = document.getElementById('timestamp');
    const memoryUsageElement = document.getElementById('memory-usage');
    const terminalStatusElement = document.getElementById('terminal-status');
    
    // Setup event listeners for search
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('keydown', handleKeyDown);
    
    // Setup event listeners for theme customization
    themeSelect.addEventListener('change', changeTheme);
    fontSmaller.addEventListener('click', decreaseFontSize);
    fontReset.addEventListener('click', resetFontSize);
    fontLarger.addEventListener('click', increaseFontSize);
    toggleLineNumbers.addEventListener('change', toggleLineNumberDisplay);
    toggleAnimations.addEventListener('change', toggleAnimationSetting);
    
    // Add typewriter effect to system messages
    addTypewriterEffect();
    
    // Load the JSON data
    loadTeamData();
    
    // Start the clock and memory usage simulation
    updateTimestamp();
    setInterval(updateTimestamp, 1000);
    updateMemoryUsage();
    setInterval(updateMemoryUsage, 5000);
    
    // Focus on input
    setTimeout(() => {
        searchInput.focus();
    }, 1000);
});

// Add typewriter effect to system messages
function addTypewriterEffect() {
    const messages = document.querySelectorAll('.terminal-output p');
    messages.forEach((message, index) => {
        message.style.display = 'none';
    });
    
    let i = 0;
    const interval = setInterval(() => {
        if (i < messages.length) {
            messages[i].style.display = 'block';
            i++;
        } else {
            clearInterval(interval);
        }
    }, 300);
}

// Handle keyboard events for the search input
function handleKeyDown(event) {
    // Handle Enter key
    if (event.key === 'Enter') {
        const searchTerm = searchInput.value.trim();
        
        if (searchTerm) {
            // Add to command history
            commandHistory.push(searchTerm);
            historyIndex = commandHistory.length;
            
            // Add command to terminal output
            appendToTerminal(`root@server:~$ ${searchTerm}`, 'command');
            
            // Process command
            processCommand(searchTerm);
        }
    }
    
    // Handle Up/Down for command history
    if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            searchInput.value = commandHistory[historyIndex];
        }
    } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            searchInput.value = commandHistory[historyIndex];
        } else {
            historyIndex = commandHistory.length;
            searchInput.value = '';
        }
    }
    
    // Handle tab key for autocomplete
    if (event.key === 'Tab') {
        event.preventDefault();
        if (suggestionsDropdown.classList.contains('active') && 
            suggestionsDropdown.children.length > 0) {
            // Select the first suggestion
            const firstSuggestion = suggestionsDropdown.children[0];
            const dataId = firstSuggestion.dataset.id;
            const member = teamData.find(m => m["Login ID"] == dataId);
            if (member) {
                searchInput.value = member["Agent Name"];
                suggestionsDropdown.classList.remove('active');
            }
        }
    }
}

// Process terminal commands
function processCommand(command) {
    // Clear old messages
    hidePlaceholders();
    
    // Handle help command
    if (command.toLowerCase() === 'help') {
        appendToTerminal('Available commands:', 'system-message');
        appendToTerminal('  search [term] - Search for team members', 'system-message');
        appendToTerminal('  theme [name] - Change terminal theme (default, matrix, hacker, retro, neon, dark)', 'system-message');
        appendToTerminal('  font [+/-/reset] - Adjust font size', 'system-message');
        appendToTerminal('  toggle [lines/animations] - Toggle line numbers or animations', 'system-message');
        appendToTerminal('  clear - Clear terminal output', 'system-message');
        appendToTerminal('  help - Show this help message', 'system-message');
        appendToTerminal('  exit - Exit the terminal (just kidding, you can\'t)', 'system-message');
        return;
    }
    
    // Handle clear command
    if (command.toLowerCase() === 'clear') {
        clearTerminal();
        return;
    }
    
    // Handle exit command
    if (command.toLowerCase() === 'exit') {
        appendToTerminal('Nice try...', 'warning-message');
        return;
    }
    
    // Handle theme command
    if (command.toLowerCase().startsWith('theme')) {
        const themeName = command.substring(5).trim().toLowerCase();
        
        if (!themeName) {
            appendToTerminal('[INFO] Current theme: ' + settings.theme, 'system-message');
            appendToTerminal('[INFO] Available themes: default, matrix, hacker, retro, neon, dark', 'system-message');
            return;
        }
        
        if (themes.hasOwnProperty(themeName)) {
            changeTheme(themeName);
            return;
        } else {
            appendToTerminal(`[ERROR] Unknown theme: "${themeName}"`, 'error-message');
            appendToTerminal('[INFO] Available themes: default, matrix, hacker, retro, neon, dark', 'system-message');
            return;
        }
    }
    
    // Handle font command
    if (command.toLowerCase().startsWith('font')) {
        const fontArg = command.substring(4).trim().toLowerCase();
        
        switch (fontArg) {
            case '+':
                increaseFontSize();
                break;
            case '-':
                decreaseFontSize();
                break;
            case 'reset':
                resetFontSize();
                break;
            default:
                appendToTerminal('[INFO] Current font size: ' + settings.fontSize + 'px', 'system-message');
                appendToTerminal('[INFO] Use: font +/- to adjust or font reset to reset', 'system-message');
        }
        return;
    }
    
    // Handle toggle command
    if (command.toLowerCase().startsWith('toggle')) {
        const toggleArg = command.substring(6).trim().toLowerCase();
        
        switch (toggleArg) {
            case 'lines':
                toggleLineNumberDisplay();
                break;
            case 'animations':
                toggleAnimationSetting();
                break;
            default:
                appendToTerminal('[INFO] Toggle options: lines, animations', 'system-message');
                appendToTerminal('[INFO] Line numbers: ' + (settings.lineNumbers ? 'on' : 'off'), 'system-message');
                appendToTerminal('[INFO] Animations: ' + (settings.animations ? 'on' : 'off'), 'system-message');
        }
        return;
    }
    
    // Handle search command
    if (command.toLowerCase().startsWith('search') || 
        !command.includes(' ')) {
        // Extract search term - either after 'search' or the whole command
        let searchTerm = command.toLowerCase();
        if (searchTerm.startsWith('search')) {
            searchTerm = command.substring(6).trim();
        }
        
        if (searchTerm) {
            handleSearch(searchTerm);
        } else {
            appendToTerminal('[ERROR] Please provide a search term', 'error-message');
        }
        return;
    }
    
    // Unknown command
    appendToTerminal(`Unknown command: ${command}`, 'error-message');
    appendToTerminal('Type "help" for available commands', 'system-message');
}

// Load team data from JSON file
async function loadTeamData() {
    try {
        const response = await fetch('english_Team_Data.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Ensure the data is in the expected format
        if (!Array.isArray(data)) {
            throw new Error('Invalid data format: expected an array of team members');
        }
        
        // Store the team data
        teamData = data;
        console.log('Team data loaded successfully:', teamData.length, 'members');
        
    } catch (error) {
        console.error('Error fetching team data:', error);
        
        // Show error message
        errorMessage.style.display = 'flex';
        errorText.textContent = `Error loading team data: ${error.message}`;
    }
}

// Function to check if a member contains the search term in any field
function memberContainsSearchTerm(member, searchTerm) {
    // Check all fields of the member for the search term
    for (const key in member) {
        if (member[key] !== null && member[key] !== undefined) {
            const fieldValue = member[key].toString().toLowerCase();
            if (fieldValue.includes(searchTerm)) {
                return true;
            }
        }
    }
    return false;
}

// Handle search input for suggestions
function handleSearchInput() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    // Clear previous suggestions
    suggestionsDropdown.innerHTML = '';
    
    // Hide dropdown if search term is empty
    if (!searchTerm) {
        suggestionsDropdown.classList.remove('active');
        return;
    }
    
    // Filter team members based on search term across ALL fields (partial match)
    const matchingMembers = teamData.filter(member => memberContainsSearchTerm(member, searchTerm));
    
    // Display suggestions if there are matching members
    if (matchingMembers.length > 0) {
        matchingMembers.forEach(member => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            suggestionItem.dataset.id = member["Login ID"];
            
            const nameElement = document.createElement('div');
            nameElement.className = 'suggestion-name';
            nameElement.textContent = member["Agent Name"];
            
            // Create a more informative second line for each suggestion
            const infoElement = document.createElement('div');
            infoElement.className = 'suggestion-phone';
            
            // Show HR ID and Mobile where available
            let infoText = '';
            if (member["HR ID"]) {
                infoText += `HR ID: ${member["HR ID"]} `;
            }
            if (member["Mobile No"]) {
                infoText += `Mobile: ${member["Mobile No"]}`;
            }
            infoElement.textContent = infoText || 'No additional info';
            
            suggestionItem.appendChild(nameElement);
            suggestionItem.appendChild(infoElement);
            
            // Add click event listener
            suggestionItem.addEventListener('click', () => {
                searchInput.value = member["Agent Name"];
                suggestionsDropdown.classList.remove('active');
                displayMemberDetails(member);
            });
            
            suggestionsDropdown.appendChild(suggestionItem);
        });
        
        suggestionsDropdown.classList.add('active');
    } else {
        // No matching members
        const noMatchItem = document.createElement('div');
        noMatchItem.className = 'suggestion-item';
        noMatchItem.textContent = 'No matching team members found';
        suggestionsDropdown.appendChild(noMatchItem);
        suggestionsDropdown.classList.add('active');
    }
}

// Handle search
function handleSearch(searchTerm) {
    // Show loading message in terminal
    appendToTerminal(`[INFO] Searching for "${searchTerm}"...`, 'system-message');
    
    if (!searchTerm) {
        // Show error for empty search
        appendToTerminal('[ERROR] Search term cannot be empty', 'error-message');
        return;
    }
    
    // Convert to lowercase for case-insensitive search
    const normalizedTerm = searchTerm.toLowerCase();
    
    // Find exact matches in any field
    const exactMatches = teamData.filter(member => {
        for (const key in member) {
            if (member[key] !== null && member[key] !== undefined) {
                const fieldValue = member[key].toString().toLowerCase();
                if (fieldValue === normalizedTerm) {
                    return true;
                }
            }
        }
        return false;
    });
    
    // Find partial matches in any field if no exact matches
    const partialMatches = teamData.filter(member => memberContainsSearchTerm(member, normalizedTerm));
    
    // Show results
    if (exactMatches.length > 0) {
        // Display the exact match count
        appendToTerminal(`[SUCCESS] Found ${exactMatches.length} exact matches.`, 'success-message');
        
        // If many matches, list them
        if (exactMatches.length > 1) {
            appendToTerminal('[INFO] Showing first exact match. Other matches:', 'system-message');
            exactMatches.slice(1, 6).forEach((match, index) => {
                appendToTerminal(`  ${index + 2}. ${match["Agent Name"]} (ID: ${match["Login ID"]})`, 'system-message');
            });
            
            if (exactMatches.length > 6) {
                appendToTerminal(`  ... and ${exactMatches.length - 6} more matches.`, 'system-message');
            }
        }
        
        // Display the first exact match
        displayMemberDetails(exactMatches[0]);
    } 
    else if (partialMatches.length > 0) {
        // Display the partial match count
        appendToTerminal(`[INFO] Found ${partialMatches.length} partial matches.`, 'system-message');
        
        // If many matches, list them
        if (partialMatches.length > 1) {
            appendToTerminal('[INFO] Showing first match. Other matches:', 'system-message');
            partialMatches.slice(1, 6).forEach((match, index) => {
                appendToTerminal(`  ${index + 2}. ${match["Agent Name"]} (ID: ${match["Login ID"]})`, 'system-message');
            });
            
            if (partialMatches.length > 6) {
                appendToTerminal(`  ... and ${partialMatches.length - 6} more matches.`, 'system-message');
            }
        }
        
        // Display the first partial match
        displayMemberDetails(partialMatches[0]);
    } 
    else {
        // No matches found
        appendToTerminal(`[WARNING] No matches found for "${searchTerm}"`, 'warning-message');
    }
}

// Add terminal output
function appendToTerminal(text, className = '') {
    const line = document.createElement('p');
    line.textContent = text;
    
    // Apply class if provided
    if (className) {
        line.className = className;
    }
    
    // Apply animation if enabled
    if (settings.animations && className !== 'command') {
        line.classList.add('animated-line');
    }
    
    // Apply line numbers if enabled
    if (settings.lineNumbers) {
        line.classList.add('with-line-number');
        line.dataset.lineNumber = settings.currentLineNumber++;
    }
    
    terminalOutput.appendChild(line);
    
    // Scroll to bottom
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
    
    return line;
}

// Clear terminal output
function clearTerminal() {
    terminalOutput.innerHTML = '';
    appendToTerminal('Terminal cleared.', 'system-message');
    appendToTerminal('--------------------------------------------------', 'system-message');
}

// Display team member details in terminal style
function displayMemberDetails(member) {
    // Store selected member ID
    selectedMemberId = member["Login ID"];
    
    // Hide all placeholders and messages
    hidePlaceholders();
    
    // Show contact details section
    contactDetails.style.display = 'block';
    
    // Clear previous details
    contactDetails.innerHTML = '';
    
    // Add a header
    appendToTerminal(`\n[RESULT] Found user: ${member["Agent Name"]}`, 'success-message');
    
    // Create header section
    const detailsHeader = document.createElement('div');
    detailsHeader.className = 'details-header';
    detailsHeader.textContent = `# USER DATA: ${member["Agent Name"]} (ID: ${member["Login ID"]})`;
    
    // Create content container
    const detailsContent = document.createElement('div');
    detailsContent.className = 'details-content';
    
    // Add all available fields
    addDetailRow(detailsContent, 'Login_ID', member["Login ID"]);
    
    if (member["Team Leader"]) {
        addDetailRow(detailsContent, 'Team_Leader', member["Team Leader"]);
    }
    
    if (member["Language"]) {
        addDetailRow(detailsContent, 'Language', member["Language"]);
    }
    
    if (member["HR ID"]) {
        addDetailRow(detailsContent, 'HR_ID', member["HR ID"]);
    }
    
    if (member["Email"]) {
        addDetailRow(detailsContent, 'Email', member["Email"]);
    }
    
    if (member["Mobile No"]) {
        addDetailRow(detailsContent, 'Mobile_No', member["Mobile No"]);
    }
    
    if (member["National ID"]) {
        addDetailRow(detailsContent, 'National_ID', member["National ID"]);
    }
    
    if (member["Date of Birth"]) {
        addDetailRow(detailsContent, 'Date_of_Birth', member["Date of Birth"]);
    }
    
    if (member["Birth Governorate"]) {
        addDetailRow(detailsContent, 'Birth_Governorate', member["Birth Governorate"]);
    }
    
    if (member["Birth Registration Order"]) {
        addDetailRow(detailsContent, 'Birth_Registration_Order', member["Birth Registration Order"]);
    }
    
    if (member["Gender"]) {
        addDetailRow(detailsContent, 'Gender', member["Gender"]);
    }
    
    if (member["Go Live Date"]) {
        // Convert timestamp to readable date
        const date = new Date(member["Go Live Date"]);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        addDetailRow(detailsContent, 'Go_Live_Date', formattedDate);
    }
    
    // Append to the details container
    contactDetails.appendChild(detailsHeader);
    contactDetails.appendChild(detailsContent);
    
    // Clear input and focus on it
    searchInput.value = '';
    searchInput.focus();
}

// Add a detail row to the details content
function addDetailRow(container, label, value) {
    const row = document.createElement('div');
    row.className = 'detail-row';
    
    const labelElement = document.createElement('span');
    labelElement.className = 'detail-label';
    labelElement.textContent = `${label}: `;
    
    const valueElement = document.createElement('span');
    valueElement.className = 'detail-value';
    valueElement.textContent = value;
    
    row.appendChild(labelElement);
    row.appendChild(valueElement);
    container.appendChild(row);
}

// Hide all placeholder and status messages
function hidePlaceholders() {
    placeholderMessage.style.display = 'none';
    loadingMessage.style.display = 'none';
    errorMessage.style.display = 'none';
    noResults.style.display = 'none';
    contactDetails.style.display = 'none';
    
    // Also hide suggestions
    suggestionsDropdown.classList.remove('active');
}

// Document click event to close dropdown when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.closest('#suggestions-dropdown') && 
        !event.target.closest('#search-input')) {
        suggestionsDropdown.classList.remove('active');
    }
});

// Change the terminal theme
function changeTheme(themeName) {
    // If a theme object was passed, get the name
    if (typeof themeName !== 'string') {
        themeName = themeName.target.value;
    }
    
    // Remove previous theme class if any
    document.body.classList.remove('theme-matrix', 'theme-hacker', 'theme-retro', 'theme-neon', 'theme-dark');
    
    // Apply new theme if not default
    if (themeName !== 'default') {
        document.body.classList.add(themes[themeName]);
    }
    
    // Store the theme setting
    settings.theme = themeName;
    
    // Update the dropdown if it didn't trigger this change
    if (typeof themeName === 'string') {
        const themeSelect = document.getElementById('theme-select');
        themeSelect.value = themeName;
    }
    
    appendToTerminal(`[CONFIG] Theme changed to: ${themeName}`, 'success-message');
    
    // Update terminal status
    document.getElementById('terminal-status').textContent = `THEME: ${themeName.toUpperCase()}`;
}

// Increase font size
function increaseFontSize() {
    if (settings.fontSize < 24) {
        settings.fontSize += 2;
        document.documentElement.style.setProperty('--terminal-font-size', `${settings.fontSize}px`);
        appendToTerminal(`[CONFIG] Font size increased to ${settings.fontSize}px`, 'system-message');
    } else {
        appendToTerminal('[CONFIG] Maximum font size reached', 'warning-message');
    }
}

// Decrease font size
function decreaseFontSize() {
    if (settings.fontSize > 10) {
        settings.fontSize -= 2;
        document.documentElement.style.setProperty('--terminal-font-size', `${settings.fontSize}px`);
        appendToTerminal(`[CONFIG] Font size decreased to ${settings.fontSize}px`, 'system-message');
    } else {
        appendToTerminal('[CONFIG] Minimum font size reached', 'warning-message');
    }
}

// Reset font size
function resetFontSize() {
    settings.fontSize = 14;
    document.documentElement.style.setProperty('--terminal-font-size', `${settings.fontSize}px`);
    appendToTerminal(`[CONFIG] Font size reset to ${settings.fontSize}px`, 'system-message');
}

// Toggle line numbers
function toggleLineNumberDisplay() {
    settings.lineNumbers = !settings.lineNumbers;
    
    // Update checkbox state if triggered via command
    document.getElementById('toggle-line-numbers').checked = settings.lineNumbers;
    
    if (settings.lineNumbers) {
        // Add line numbers to existing lines
        const lines = terminalOutput.querySelectorAll('p');
        lines.forEach((line, index) => {
            line.classList.add('with-line-number');
            line.dataset.lineNumber = index + 1;
        });
        
        // Update the current line counter
        settings.currentLineNumber = lines.length + 1;
        appendToTerminal('[CONFIG] Line numbers enabled', 'system-message');
    } else {
        // Remove line numbers
        const lines = terminalOutput.querySelectorAll('p');
        lines.forEach(line => {
            line.classList.remove('with-line-number');
            delete line.dataset.lineNumber;
        });
        appendToTerminal('[CONFIG] Line numbers disabled', 'system-message');
    }
}

// Toggle animation setting
function toggleAnimationSetting() {
    settings.animations = !settings.animations;
    
    // Update checkbox state if triggered via command
    document.getElementById('toggle-animations').checked = settings.animations;
    
    if (settings.animations) {
        appendToTerminal('[CONFIG] Animations enabled', 'system-message');
    } else {
        appendToTerminal('[CONFIG] Animations disabled', 'system-message');
    }
}

// Update timestamp in footer
function updateTimestamp() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const timestamp = document.getElementById('timestamp');
    if (timestamp) {
        timestamp.textContent = `${hours}:${minutes}:${seconds}`;
    }
}

// Update memory usage with random values for visual effect
function updateMemoryUsage() {
    const memoryElement = document.getElementById('memory-usage');
    if (memoryElement) {
        const randomMem = Math.floor(Math.random() * 256) + 128;
        memoryElement.textContent = `MEM: ${randomMem}MB`;
    }
}
