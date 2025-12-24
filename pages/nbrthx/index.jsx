import { useState, useRef } from 'react';
import { capacityCheck, hideInUniversal, messageToBits, revealFromUniversal } from './svgstego';

export default function StegoApp() {
  const [mode, setMode] = useState('encode'); // 'encode' or 'decode'
  const [inputSvg, setInputSvg] = useState('');
  const [outputSvg, setOutputSvg] = useState('');
  const [message, setMessage] = useState('');
  const [decodedMessage, setDecodedMessage] = useState('');
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setInputSvg(content);
      
      // Jika mode decode, langsung proses decode
      if (mode === 'decode') {
        handleDecode(content);
      }
    };
    reader.readAsText(file);
  };

  const parser = typeof window != 'undefined' ? new DOMParser() : {}

  // Encode message into SVG
  const handleEncode = () => {
    if (!inputSvg) {
      alert('Please upload an SVG file first');
      return;
    }
    
    if (!message.trim()) {
      alert('Please enter a message to hide');
      return;
    }

    setIsProcessing(true);
    
    try {
      const rawSvg = parser.parseFromString(inputSvg, "image/svg+xml")

      // Panggil fungsi encode dari svgstego.js
      const encodedSvg = hideInUniversal(rawSvg, message);
      setOutputSvg(encodedSvg);
      
      // Buat blob untuk download
      const blob = new Blob([encodedSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      // Buat link download
      const link = document.createElement('a');
      link.href = url;
      link.download = `encoded-${fileName || 'stego.svg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Encoding error:', error);
      alert('Error encoding message: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Decode message from SVG
  const handleDecode = (svgContent = null) => {
    const rawSvg = svgContent || inputSvg;

    const contentToDecode = parser.parseFromString(rawSvg, "image/svg+xml")
    
    if (!contentToDecode) {
      alert('Please upload an SVG file first');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Panggil fungsi decode dari svgstego.js
      const decoded = revealFromUniversal(contentToDecode);
      setDecodedMessage(decoded);
    } catch (error) {
      console.error('Decoding error:', error);
      alert('Error decoding message: ' + error.message);
      setDecodedMessage('');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset all states
  const handleReset = () => {
    setInputSvg('');
    setOutputSvg('');
    setMessage('');
    setDecodedMessage('');
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Copy decoded message to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(decodedMessage)
      .then(() => alert('Message copied to clipboard!'))
      .catch(err => console.error('Copy failed:', err));
  };

  const showCapacity = () => {
    if(typeof window == 'undefined') return ''
    return capacityCheck(parser.parseFromString(inputSvg, 'image/svg+xml'))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            SVG Steganography Tool
          </h1>
          <p className="text-gray-300">
            Hide and reveal secret messages in SVG files using steganography
          </p>
        </header>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-10">
          <div className="bg-gray-800 rounded-lg p-1 inline-flex">
            <button
              onClick={() => setMode('encode')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${mode === 'encode' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'}`}
            >
              <i className="fas fa-lock mr-2"></i>
              Encode Message
            </button>
            <button
              onClick={() => setMode('decode')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${mode === 'decode' 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'}`}
            >
              <i className="fas fa-unlock mr-2"></i>
              Decode Message
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <i className="fas fa-upload mr-3 text-blue-400"></i>
              {mode === 'encode' ? 'Input SVG & Message' : 'Upload SVG to Decode'}
            </h2>
            
            {/* File Upload */}
            <div className="mb-6">
              <label className="block mb-3 font-medium">
                Upload SVG File
                {fileName && (
                  <span className="ml-3 text-sm text-green-400">
                    ✓ {fileName}
                  </span>
                )}
              </label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".svg"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <i className="fas fa-cloud-upload-alt text-4xl text-gray-500 mb-3"></i>
                  <p className="text-gray-400">Click to upload SVG file</p>
                  <p className="text-sm text-gray-500 mt-2">.svg files only</p>
                </label>
              </div>
            </div>

            {/* Message Input (for encode mode) */}
            {mode === 'encode' && (
              <div className="mb-6">
                <label className="block mb-3 font-medium">
                  <i className="fas fa-message mr-2 text-blue-400"></i>
                  Secret Message to Hide <br />
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your secret message here..."
                  className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows="4"
                />
                <div className="text-sm text-gray-400 mt-2 flex justify-between">
                  <span>available { showCapacity() } from {messageToBits(message).length} bit</span><br />
                  <span>Max capacity depends on SVG size</span>
                </div>
              </div>
            )}

            {/* Preview SVG (if uploaded) */}
            {inputSvg && (
              <div className="mt-6">
                <h3 className="font-medium mb-3">SVG Preview</h3>
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <div 
                    className="h-40 flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: inputSvg }}
                  />
                  <p className="text-sm text-gray-400 mt-2 text-center">
                    Original SVG ({inputSvg.length.toLocaleString()} bytes)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Output */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              {mode === 'encode' ? (
                <>
                  <i className="fas fa-download mr-3 text-green-400"></i>
                  Encoded SVG Output
                </>
              ) : (
                <>
                  <i className="fas fa-key mr-3 text-purple-400"></i>
                  Decoded Message
                </>
              )}
            </h2>

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="mb-6 text-center p-4 bg-gray-900/50 rounded-lg">
                <div className="inline-flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-3"></div>
                  <span className="text-lg">
                    {mode === 'encode' ? 'Encoding message...' : 'Decoding message...'}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  This may take a moment depending on file size
                </p>
              </div>
            )}

            {/* Output Content */}
            {mode === 'encode' ? (
              <div className="space-y-6">
                {outputSvg && (
                  <>
                    <div>
                      <h3 className="font-medium mb-3">Encoded SVG Preview</h3>
                      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                        <div 
                          className="h-40 flex items-center justify-center"
                          dangerouslySetInnerHTML={{ __html: outputSvg }}
                        />
                        <p className="text-sm text-gray-400 mt-2 text-center">
                          Stego SVG ({outputSvg.length.toLocaleString()} bytes)
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
                      <p className="text-green-400 flex items-center">
                        <i className="fas fa-check-circle mr-2"></i>
                        Message successfully encoded into SVG!
                      </p>
                      <p className="text-sm text-gray-300 mt-2">
                        The file has been downloaded automatically. You can also save it by right-clicking the preview.
                      </p>
                    </div>
                  </>
                )}
                
                {!outputSvg && !isProcessing && (
                  <div className="text-center p-8 text-gray-500">
                    <i className="fas fa-lock-open text-5xl mb-4"></i>
                    <p>Upload an SVG file and enter a message to encode</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {decodedMessage && (
                  <>
                    <div className="bg-gray-900 rounded-lg p-5 border border-gray-700">
                      <label className="block mb-3 font-medium text-green-400">
                        <i className="fas fa-secret mr-2"></i>
                        Hidden Message Found:
                      </label>
                      <div className="whitespace-pre-wrap break-words p-4 bg-black/30 rounded-lg font-mono">
                        <b>{decodedMessage}</b>
                      </div>
                      <br />
                      <button
                        onClick={copyToClipboard}
                        className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                      >
                        <i className="fas fa-copy mr-2"></i>
                        Copy to Clipboard
                      </button>
                    </div>
                    
                    <div className="p-4 bg-purple-900/20 border border-purple-700 rounded-lg">
                      <p className="text-purple-400 flex items-center">
                        <i className="fas fa-key mr-2"></i>
                        Message successfully decoded!
                      </p>
                      <p className="text-sm text-gray-300 mt-2">
                        The hidden message has been extracted from the SVG file.
                      </p>
                    </div>
                  </>
                )}
                
                {!decodedMessage && !isProcessing && inputSvg && (
                  <div className="text-center p-8">
                    <button
                      onClick={() => handleDecode()}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg"
                    >
                      <i className="fas fa-search mr-2"></i>
                      Decode Hidden Message
                    </button>
                    <p className="text-sm text-gray-400 mt-4">
                      Click the button to extract any hidden message from the uploaded SVG
                    </p>
                  </div>
                )}
                
                {!decodedMessage && !isProcessing && !inputSvg && (
                  <div className="text-center p-8 text-gray-500">
                    <i className="fas fa-search text-5xl mb-4"></i>
                    <p>Upload an SVG file to decode hidden messages</p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              {mode === 'encode' ? (
                <button
                  onClick={handleEncode}
                  disabled={isProcessing || !inputSvg || !message.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                      Encoding...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-lock mr-2"></i>
                      Encode & Download SVG
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => handleDecode()}
                  disabled={isProcessing || !inputSvg}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                      Decoding...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-unlock mr-2"></i>
                      Decode Message
                    </>
                  )}
                </button>
              )}
              
              <button
                onClick={handleReset}
                className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                <i className="fas fa-redo mr-2"></i>
                Reset All
              </button>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-10 bg-gray-800/30 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <i className="fas fa-info-circle mr-3 text-yellow-400"></i>
            How SVG Steganography Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <div className="text-blue-400 mb-2">
                <i className="fas fa-code text-2xl"></i>
              </div>
              <h4 className="font-bold mb-2">SVG Structure</h4>
              <p className="text-sm text-gray-300">
                SVG files are XML-based text files that describe vector graphics. This makes them perfect for hiding data in elements, attributes, and whitespace.
              </p>
            </div>
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <div className="text-green-400 mb-2">
                <i className="fas fa-eye-slash text-2xl"></i>
              </div>
              <h4 className="font-bold mb-2">Encoding Process</h4>
              <p className="text-sm text-gray-300">
                Messages are hidden by making subtle, imperceptible changes to the SVG's numerical values, element order, or metadata without affecting visual appearance.
              </p>
            </div>
            <div className="p-4 bg-gray-900/50 rounded-lg">
              <div className="text-purple-400 mb-2">
                <i className="fas fa-shield-alt text-2xl"></i>
              </div>
              <h4 className="font-bold mb-2">Security Features</h4>
              <p className="text-sm text-gray-300">
                The hidden message is not visible when viewing the image and requires this specific tool to extract. File size remains virtually unchanged.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-10 text-center text-gray-500 text-sm">
          <p>
            SVG Steganography Tool • Using hideInUniversal() and revealFromUniversal() functions
          </p>
          <p className="mt-2">
            Note: This tool processes files locally in your browser. No data is sent to any server.
          </p>
        </footer>
      </div>

      {/* Add Font Awesome for icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      
      {/* Add custom styles */}
      <style jsx global>{`
        svg {
          max-width: 300px;
          max-height: 300px;
        }
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }
      `}</style>
    </div>
  );
}