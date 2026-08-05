/**
 * Safely parses API responses and throws friendly error messages if the server
 * returns non-JSON content (e.g., 404 HTML pages or network errors).
 */
export async function parseApiResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('API route not found (HTTP 404). Please ensure the backend server is running.');
      }
      throw new Error(`Server returned HTTP ${res.status}: ${text.slice(0, 100)}`);
    }
    throw new Error('Received non-JSON response from server.');
  }

  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) {
      window.dispatchEvent(new CustomEvent('lifeloop:unauthorized'));
    }
    throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

/**
 * Robust copy-to-clipboard utility with fallback for iFrames and non-secure contexts
 */
export async function copyToClipboard(text) {
  if (!text) return false;

  // Try standard navigator.clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard failed, attempting fallback:', err);
    }
  }

  // Fallback for iframe / permission-blocked environments
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('All clipboard copy attempts failed:', err);
    return false;
  }
}
