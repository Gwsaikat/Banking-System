import { useState } from 'react';
import { uploadDocumentAPI, queryDocumentsAPI } from '../api';
import { Upload, Search, FileText, Sparkles, Loader2, CheckCircle, X, File } from 'lucide-react';
import toast from 'react-hot-toast';

const Documents = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setUploadResult(null);
    } else {
      toast.error('Please select a PDF file');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === 'application/pdf') {
      setFile(dropped);
      setUploadResult(null);
    } else {
      toast.error('Please drop a PDF file');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', file);
      const res = await uploadDocumentAPI(formData);
      setUploadResult(res.data);
      setFile(null);
      toast.success(`Document embedded into ${res.data.chunks} chunks!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await queryDocumentsAPI({ query });
      setResults(res.data.results || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="documents-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Document Intelligence</h1>
          <p className="page-subtitle">Upload bank statements or loan documents and query them with AI</p>
        </div>
      </div>

      <div className="documents-grid">
        {/* Upload Section */}
        <div className="card documents-upload-card">
          <div className="card-header">
            <div className="card-header-icon" style={{ background: 'var(--gradient-primary)' }}>
              <Upload size={20} />
            </div>
            <h3>Upload Document</h3>
          </div>

          <div
            className={`documents-dropzone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !file && document.getElementById('file-input').click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            {file ? (
              <div className="documents-file-preview">
                <div className="documents-file-icon">
                  <FileText size={32} />
                </div>
                <div className="documents-file-info">
                  <span className="documents-file-name">{file.name}</span>
                  <span className="documents-file-size">{formatFileSize(file.size)}</span>
                </div>
                <button className="documents-file-remove" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="documents-dropzone-content">
                <div className="documents-dropzone-icon">
                  <Upload size={36} />
                </div>
                <p className="documents-dropzone-text">Drag & drop your PDF here</p>
                <p className="documents-dropzone-hint">or click to browse</p>
              </div>
            )}
          </div>

          <button
            className="btn btn-primary documents-upload-btn"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? (
              <><Loader2 size={18} className="spin" /> Processing...</>
            ) : (
              <><Sparkles size={18} /> Embed Document</>
            )}
          </button>

          {uploadResult && (
            <div className="documents-upload-result">
              <CheckCircle size={18} style={{ color: 'var(--success)' }} />
              <span>Successfully embedded into <strong>{uploadResult.chunks}</strong> semantic chunks</span>
            </div>
          )}
        </div>

        {/* Query Section */}
        <div className="card documents-query-card">
          <div className="card-header">
            <div className="card-header-icon" style={{ background: 'var(--gradient-accent)' }}>
              <Search size={20} />
            </div>
            <h3>Query Documents</h3>
          </div>

          <form onSubmit={handleSearch} className="documents-search-form">
            <div className="documents-search-wrapper">
              <Search size={18} className="documents-search-icon" />
              <input
                type="text"
                className="documents-search-input"
                placeholder="Ask anything about your uploaded documents..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={searching || !query.trim()}>
              {searching ? <Loader2 size={18} className="spin" /> : <Search size={18} />}
              Search
            </button>
          </form>

          <div className="documents-results">
            {results.length > 0 ? (
              results.map((r, i) => (
                <div key={i} className="documents-result-card">
                  <div className="documents-result-header">
                    <File size={16} />
                    <span className="documents-result-filename">{r.fileName || 'Document'}</span>
                    {r.score && (
                      <span className="documents-result-score">
                        {(r.score * 100).toFixed(0)}% match
                      </span>
                    )}
                  </div>
                  <p className="documents-result-text">{r.text}</p>
                </div>
              ))
            ) : (
              <div className="documents-empty-results">
                <Search size={40} style={{ opacity: 0.2 }} />
                <p>Search results will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;
