// 初始化存储
if(!localStorage.getItem('seatData')) {
    localStorage.setItem('seatData', JSON.stringify({}));
}
if(!localStorage.getItem('files')) {
    localStorage.setItem('files', JSON.stringify([]));
}

// 显示登录表单
function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
}

// 登录验证
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if(username === 'AAA' && password === 'Aa112211') {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        loadFiles();
    } else {
        document.getElementById('loginError').innerText = '账号或密码错误！';
    }
}

// 登出
function logout() {
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('loginForm').reset();
}

// 文件上传处理
function uploadFile() {
    const input = document.getElementById('fileUpload');
    const files = input.files;
    
    for(let file of files) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = parseFile(e.target.result, file);
                saveFileData(file.name, data);
                updateFileList();
            } catch(error) {
                alert('文件解析失败: ' + error);
            }
        };
        if(file.name.endsWith('.xlsx')) {
            reader.readAsBinaryString(file);
        } else {
            reader.readAsText(file);
        }
    }
}

// 文件解析（支持CSV和Excel）
function parseFile(content, file) {
    const data = {};
    if(file.name.endsWith('.csv')) {
        const rows = content.split('\n');
        rows.forEach(row => {
            const [name, seat] = row.split(',');
            if(name && seat) data[name.trim()] = seat.trim();
        });
    } else if(file.name.endsWith('.xlsx')) {
        const workbook = XLSX.read(content, {type: 'binary'});
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        rows.forEach(row => {
            const name = row['姓名'] || row['name'];
            const seat = row['座位号'] || row['seat'];
            if(name && seat) data[name.trim()] = seat.trim();
        });
    }
    return data;
}

// 保存文件数据
function saveFileData(filename, data) {
    const seatData = JSON.parse(localStorage.getItem('seatData'));
    const files = JSON.parse(localStorage.getItem('files'));
    
    Object.assign(seatData, data);
    
    if(!files.includes(filename)) {
        files.push(filename);
    }
    
    localStorage.setItem('seatData', JSON.stringify(seatData));
    localStorage.setItem('files', JSON.stringify(files));
}

// 更新文件列表显示
function loadFiles() {
    const files = JSON.parse(localStorage.getItem('files'));
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '<h3>已上传文件：</h3>';
    
    files.forEach(file => {
        const div = document.createElement('div');
        div.textContent = file;
        fileList.appendChild(div);
    });
}

// 搜索功能
function searchSeat() {
    const name = document.getElementById('searchInput').value.trim();
    const seatData = JSON.parse(localStorage.getItem('seatData'));
    const resultDiv = document.getElementById('searchResult');
    
    let html = '';
    if(seatData[name]) {
        html = `
            <div>座位号：${seatData[name]}</div>
            <button onclick="generateQRCode('${name.replace("'", "\\'")}')">
                生成二维码
            </button>
        `;
        resultDiv.style.color = 'green';
    } else {
        html = '未找到匹配的座位信息';
        resultDiv.style.color = 'red';
    }
    resultDiv.innerHTML = html;
}

// 生成二维码功能
function generateQRCode(name) {
    const baseUrl = window.location.href.split('?')[0];
    const apiUrl = `${baseUrl}?api=1&name=${encodeURIComponent(name)}`;
    
    if(typeof QRCode === 'function') {
        const qrContainer = document.createElement('div');
        qrContainer.className = 'qr-result';
        
        const qrTitle = document.createElement('h3');
        qrTitle.textContent = `【${name}】的座位二维码`;
        
        const qrCode = document.createElement('div');
        new QRCode(qrCode, {
            text: apiUrl,
            width: 200,
            height: 200
        });
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '关闭';
        closeBtn.onclick = () => qrContainer.remove();
        
        qrContainer.appendChild(qrTitle);
        qrContainer.appendChild(qrCode);
        qrContainer.appendChild(closeBtn);
        document.body.appendChild(qrContainer);
    } else {
        alert('请先引入QRCode生成库');
    }
}