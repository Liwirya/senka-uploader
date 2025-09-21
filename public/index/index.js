document.addEventListener('DOMContentLoaded', () => {

        const API_BASE_URL = window.location.origin; 

        const fileInput = document.getElementById('fileInput');
        const uploadBtn = document.getElementById('uploadBtn');
        const urlResult = document.getElementById('urlResult');
        const selectedFileDiv = document.getElementById('selectedFile');
        const fileNameDisplay = document.getElementById('fileNameDisplay');
        const fileSizeDisplay = document.getElementById('fileSize');
        const fileIconDisplay = document.getElementById('fileIcon');
        const fileInputLabel = document.querySelector('.file-input-label');
        const imagePreviewContainer = document.getElementById('imagePreviewContainer');
        const imagePreviewImg = document.getElementById('imagePreview');
        const uploadHistoryDiv = document.getElementById('uploadHistory');
        const clearFileBtn = document.getElementById('clearFileBtn');
        const historyCount = document.getElementById('historyCount');

        const notificationModal = document.getElementById('notificationModal');
        const closeModalBtn = document.getElementById('closeModal');
        const modalIcon = document.getElementById('modalIcon');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        const modalActionBtn = document.getElementById('modalActionBtn');

        const uploadHistory = JSON.parse(localStorage.getItem('senkaUploadHistory')) || []; 
        const fileIcons = { 
            'pdf': '<i class="fas fa-file-pdf text-red-500"></i>', 
            'zip': '<i class="fas fa-file-archive text-yellow-500"></i>', 
            'rar': '<i class="fas fa-file-archive text-yellow-500"></i>', 
            '7z': '<i class="fas fa-file-archive text-yellow-500"></i>', 
            'js': '<i class="fab fa-js-square text-yellow-400"></i>', 
            'json': '<i class="fas fa-file-code text-blue-400"></i>', 
            'html': '<i class="fab fa-html5 text-orange-500"></i>', 
            'css': '<i class="fab fa-css3-alt text-blue-500"></i>', 
            'png': '<i class="fas fa-file-image text-purple-400"></i>', 
            'jpg': '<i class="fas fa-file-image text-purple-400"></i>', 
            'jpeg': '<i class="fas fa-file-image text-purple-400"></i>', 
            'gif': '<i class="fas fa-file-image text-purple-400"></i>', 
            'svg': '<i class="fas fa-file-image text-purple-400"></i>', 
            'mp4': '<i class="fas fa-file-video text-pink-500"></i>', 
            'mov': '<i class="fas fa-file-video text-pink-500"></i>', 
            'avi': '<i class="fas fa-file-video text-pink-500"></i>', 
            'mp3': '<i class="fas fa-file-audio text-green-500"></i>', 
            'wav': '<i class="fas fa-file-audio text-green-500"></i>', 
            'txt': '<i class="fas fa-file-alt text-gray-400"></i>', 
            'doc': '<i class="fas fa-file-word text-blue-600"></i>', 
            'docx': '<i class="fas fa-file-word text-blue-600"></i>', 
            'xls': '<i class="fas fa-file-excel text-green-600"></i>', 
            'xlsx': '<i class="fas fa-file-excel text-green-600"></i>', 
            'ppt': '<i class="fas fa-file-powerpoint text-orange-600"></i>', 
            'pptx': '<i class="fas fa-file-powerpoint text-orange-600"></i>', 
            'default': '<i class="fas fa-file text-slate-400"></i>' 
        };

        historyCount.textContent = uploadHistory.length;

        const uploadFile = async () => {
            const file = fileInput.files[0];
            if (!file) {
                showModal('Peringatan', 'Pilih file terlebih dahulu!', 'warning');
                return;
            }

            setLoadingState(true);
            renderLoadingMessage();
            urlResult.innerHTML = ''; 

            const formData = new FormData();
            formData.append('file', file); 

            try {
                const response = await fetch(`${API_BASE_URL}/api/upload`, {
                    method: 'POST',
                    body: formData 
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    renderSuccessMessage(result.fileUrl);
                    addUploadToHistory(result.fileName, result.fileUrl);
                    showModal('Sukses', 'File berhasil diupload!', 'success');
                } else {
                    renderErrorMessage(result.message || 'Terjadi kesalahan saat upload.');
                    showModal('Gagal', result.message || 'Terjadi kesalahan saat upload.', 'error');
                }

            } catch (error) {
                console.error("Detail Error:", error);
                renderErrorMessage(`Koneksi gagal atau kesalahan server: ${error.message}`);
                showModal('Gagal', `Tidak dapat terhubung ke server atau terjadi kesalahan: ${error.message}`, 'error');
            } finally {
                setLoadingState(false);
            }
        };
               
        const addUploadToHistory = (fileName, fileUrl) => {
            const uploadTime = new Date().toLocaleString('id-ID', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                hour12: false 
            });
            const historyItem = { fileName, fileUrl, uploadTime };
            uploadHistory.unshift(historyItem); 
            if (uploadHistory.length > 15) { 
                uploadHistory.pop();
            }
            localStorage.setItem('senkaUploadHistory', JSON.stringify(uploadHistory));
            renderUploadHistory();
            historyCount.textContent = uploadHistory.length;
        };

        const deleteHistoryItem = (index) => {
            uploadHistory.splice(index, 1);
            localStorage.setItem('senkaUploadHistory', JSON.stringify(uploadHistory));
            renderUploadHistory();
            historyCount.textContent = uploadHistory.length;
            showModal('Info', 'Riwayat berhasil dihapus.', 'info');
        };
        
        const renderLoadingMessage = () => {
            urlResult.innerHTML = `
                <div class="flex flex-col items-center justify-center gap-4 py-8">
                    <div class="relative">
                        <div class="w-12 h-12 border-4 border-sky-500/25 border-t-sky-400 rounded-full animate-spin"></div>
                        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <i class="fas fa-cloud-upload-alt text-sky-400 text-xl"></i>
                        </div>
                    </div>
                    <div class="text-center">
                        <h4 class="text-lg font-semibold text-slate-200 mb-1">Mengupload file...</h4>
                        <p class="text-slate-400">Mohon tunggu sebentar</p>
                    </div>
                </div>`;
        };

        const renderSuccessMessage = (url) => {
            urlResult.innerHTML = `
                <div class="result-item">
                    <div class="flex items-center gap-2 mb-4">
                        <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <i class="fas fa-check text-white text-xs"></i>
                        </div>
                        <strong class="text-lg font-bold text-green-400">Upload Berhasil!</strong>
                    </div>
                    <div class="relative">
                        <input readonly value="${url}" class="w-full bg-slate-800/60 text-sky-300 rounded-lg py-3 px-4 pr-32 border border-slate-600 focus:outline-none focus:border-sky-500 text-sm font-mono truncate" id="resultUrlInput">
                        <button class="btn-copy absolute right-2 top-1/2 -translate-y-1/2 py-2 px-4 bg-gradient-to-r from-sky-600 to-violet-600 rounded-lg text-white font-semibold transition hover:from-sky-500 hover:to-violet-500 hover:scale-105 text-sm">Salin URL</button>
                    </div>
                    <div class="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                        <a href="${url}" target="_blank" class="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-2 px-5 rounded-lg font-semibold transition hover:scale-105">
                            <i class="fas fa-eye"></i> Lihat File
                        </a>
                        <a href="${url}" download class="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-2 px-5 rounded-lg font-semibold transition hover:scale-105">
                            <i class="fas fa-download"></i> Unduh File
                        </a>
                    </div>
                </div>`;
            
            setTimeout(() => {
                urlResult.querySelector('.result-item').classList.add('show');
            }, 100);
            
            urlResult.querySelector('.btn-copy').addEventListener('click', (e) => copyToClipboard(url, e.target, 'Salin URL'));
        };
        
        const renderErrorMessage = (message) => {
            urlResult.innerHTML = `
                <div class="result-item">
                    <div class="flex items-center gap-2 mb-4">
                        <div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                            <i class="fas fa-times text-white text-xs"></i>
                        </div>
                        <strong class="text-lg font-bold text-red-400">Upload Gagal</strong>
                    </div>
                    <div class="bg-red-900/30 border border-red-700/50 rounded-lg p-4">
                        <p class="text-red-300 text-sm">${message}</p>
                    </div>
                </div>`;
            
            setTimeout(() => {
                urlResult.querySelector('.result-item').classList.add('show');
            }, 100);
        };
        
        const updateFileInfo = () => {
            const file = fileInput.files[0];
            selectedFileDiv.classList.toggle('hidden', !file);
            selectedFileDiv.classList.toggle('flex', !!file);
            imagePreviewContainer.classList.add('hidden'); 
            imagePreviewImg.src = ''; 

            if (file) {
                fileNameDisplay.textContent = file.name;
                fileSizeDisplay.textContent = formatFileSize(file.size);
                const fileExt = file.name.split('.').pop()?.toLowerCase() || 'default';
                fileIconDisplay.innerHTML = fileIcons[fileExt] || fileIcons['default'];

                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        imagePreviewImg.src = e.target.result;
                        imagePreviewContainer.classList.remove('hidden');
                    };
                    reader.readAsDataURL(file);
                }
            }
        };

        const clearSelectedFile = () => {
            fileInput.value = ''; 
            selectedFileDiv.classList.add('hidden');
            selectedFileDiv.classList.remove('flex');
            fileNameDisplay.textContent = '';
            fileSizeDisplay.textContent = '';
            fileIconDisplay.innerHTML = '';
            imagePreviewContainer.classList.add('hidden');
            imagePreviewImg.src = '';
        };
        
        const setLoadingState = (isLoading) => {
            uploadBtn.disabled = isLoading;
            if (isLoading) {
                uploadBtn.innerHTML = `
                    <span class="flex items-center justify-center gap-2">
                        <div class="w-5 h-5 border-2 border-white/25 border-t-white rounded-full animate-spin"></div>
                        <span>Mengupload...</span>
                    </span>`;
            } else {
                uploadBtn.innerHTML = `
                    <span class="flex items-center justify-center gap-2">
                        <i class="fas fa-upload"></i>
                        <span>Upload File Sekarang</span>
                    </span>`;
            }
        };

        const renderUploadHistory = () => {
            uploadHistoryDiv.innerHTML = '';
            if (uploadHistory.length === 0) {
                return; 
            }

            uploadHistory.forEach((item, index) => {
                const fileExt = item.fileName.split('.').pop()?.toLowerCase() || 'default';
                const fileIcon = fileIcons[fileExt] || fileIcons['default'];
                
                const historyItemDiv = document.createElement('div');
                historyItemDiv.className = 'history-item bg-slate-800/80 p-4 rounded-xl border border-slate-700 hover:bg-slate-700/80 transition-all duration-300';
                historyItemDiv.innerHTML = `
                    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div class="flex items-start gap-3 flex-1">
                            <div class="text-2xl flex-shrink-0 mt-1">${fileIcon}</div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2">
                                    <a href="${item.fileUrl}" target="_blank" class="text-sky-300 font-medium hover:underline text-sm sm:text-base truncate flex-1">${item.fileName}</a>
                                </div>
                                <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                                    <span class="text-xs text-slate-400">${item.uploadTime}</span>
                                    <span class="text-xs text-slate-500 hidden sm:block">•</span>
                                    <a href="${item.fileUrl}" class="text-xs text-sky-400 hover:underline flex items-center gap-1">
                                        <i class="fas fa-external-link-alt text-2xs"></i> Buka
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div class="flex gap-2 flex-shrink-0">
                            <button class="btn-copy-history p-2 bg-slate-700 hover:bg-sky-600 rounded-lg text-slate-300 hover:text-white transition-all duration-300" data-url="${item.fileUrl}" title="Salin URL">
                                <i class="fas fa-copy text-sm"></i>
                            </button>
                            <button class="btn-delete-history p-2 bg-slate-700 hover:bg-red-600 rounded-lg text-slate-300 hover:text-white transition-all duration-300" data-index="${index}" title="Hapus dari riwayat">
                                <i class="fas fa-trash-alt text-sm"></i>
                            </button>
                        </div>
                    </div>`;
                uploadHistoryDiv.appendChild(historyItemDiv);
            });

            setTimeout(() => {
                uploadHistoryDiv.querySelectorAll('.history-item').forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('show');
                    }, index * 100);
                });
            }, 100);

            uploadHistoryDiv.querySelectorAll('.btn-copy-history').forEach(button => {
                button.addEventListener('click', (e) => {
                    const url = e.target.closest('button').dataset.url;
                    copyToClipboard(url, e.target.closest('button'), 'Salin');
                    
                    const btn = e.target.closest('button');
                    btn.classList.add('bg-green-600');
                    btn.innerHTML = '<i class="fas fa-check text-sm"></i>';
                    setTimeout(() => {
                        btn.classList.remove('bg-green-600');
                        btn.innerHTML = '<i class="fas fa-copy text-sm"></i>';
                    }, 2000);
                });
            });

            uploadHistoryDiv.querySelectorAll('.btn-delete-history').forEach(button => {
                button.addEventListener('click', (e) => {
                    const index = parseInt(e.target.closest('button').dataset.index);
                    showModal('Konfirmasi Hapus', 'Anda yakin ingin menghapus riwayat ini?', 'confirm', () => deleteHistoryItem(index));
                });
            });
        };

        const copyToClipboard = (text, btnElement, originalText) => {
            navigator.clipboard.writeText(text).then(() => {
                if (btnElement) {
                    const originalContent = btnElement.innerHTML;
                    
                    btnElement.innerHTML = '<i class="fas fa-check"></i> Tersalin!';
                    btnElement.classList.add('bg-green-600');
                    
                    setTimeout(() => { 
                        btnElement.innerHTML = originalContent;
                        btnElement.classList.remove('bg-green-600');
                    }, 2000);
                }
                
                showModal('Sukses', 'URL berhasil disalin ke clipboard!', 'success');
            }).catch(err => {
                console.error('Gagal menyalin:', err);
                if (btnElement) {
                    btnElement.textContent = 'Gagal Salin';
                    setTimeout(() => { btnElement.textContent = originalText; }, 2000);
                }
                showModal('Error', 'Gagal menyalin ke clipboard. Coba lagi.', 'error');
            });
        };
        
        const formatFileSize = (bytes) => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
        };

        const showModal = (title, message, type, onConfirm = null) => {
            modalTitle.textContent = title;
            modalMessage.textContent = message;
            modalActionBtn.onclick = null;
            modalActionBtn.classList.add('hidden');

            modalIcon.innerHTML = ''; 
            switch (type) {
                case 'success':
                    modalIcon.innerHTML = '<i class="fas fa-check-circle text-green-500"></i>';
                    break;
                case 'error':
                    modalIcon.innerHTML = '<i class="fas fa-times-circle text-red-500"></i>';
                    break;
                case 'warning':
                    modalIcon.innerHTML = '<i class="fas fa-exclamation-triangle text-yellow-500"></i>';
                    break;
                case 'info':
                    modalIcon.innerHTML = '<i class="fas fa-info-circle text-blue-500"></i>';
                    break;
                case 'confirm':
                    modalIcon.innerHTML = '<i class="fas fa-question-circle text-sky-500"></i>';
                    modalActionBtn.classList.remove('hidden');
                    modalActionBtn.textContent = 'Ya, Hapus';
                    modalActionBtn.onclick = () => {
                        if (onConfirm) onConfirm();
                        hideModal();
                    };
                    break;
                default:
                    modalIcon.innerHTML = '';
            }

            notificationModal.classList.remove('hidden');
            setTimeout(() => {
                notificationModal.classList.remove('opacity-0');
                notificationModal.querySelector('div').classList.remove('scale-95');
                notificationModal.querySelector('div').classList.add('scale-100');
            }, 10); 
        };

        const hideModal = () => {
            notificationModal.querySelector('div').classList.remove('scale-100');
            notificationModal.querySelector('div').classList.add('scale-95');
            notificationModal.classList.add('opacity-0');
            setTimeout(() => notificationModal.classList.add('hidden'), 300);
        };

        uploadBtn.addEventListener('click', uploadFile);
        fileInput.addEventListener('change', updateFileInfo);
        clearFileBtn.addEventListener('click', clearSelectedFile);
        closeModalBtn.addEventListener('click', hideModal);
        notificationModal.addEventListener('click', (e) => {
            if (e.target === notificationModal) { 
                hideModal();
            }
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            fileInputLabel.addEventListener(eventName, (e) => {
                e.preventDefault();
                fileInputLabel.classList.add('drag-over');
            }, false);
        });
        ['dragleave', 'drop'].forEach(eventName => {
            fileInputLabel.addEventListener(eventName, (e) => {
                e.preventDefault();
                fileInputLabel.classList.remove('drag-over');
            }, false);
        });

        fileInputLabel.addEventListener('drop', e => {
            fileInput.files = e.dataTransfer.files;
            updateFileInfo();
            uploadFile(); 
        }, false);

        renderUploadHistory();
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target === fileInput) {
                uploadFile();
            }
        });
    });