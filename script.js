// Attendance Data Management
class AttendanceSystem {
    constructor() {
        this.logs = JSON.parse(localStorage.getItem('rfid_logs')) || [];
        this.init();
    }

    init() {
        this.renderLogs();
        this.updateStats();
        this.startTimeDisplay();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Attendance Form
        document.getElementById('attendance-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleScan();
        });

        // Filters
        document.getElementById('search-name').addEventListener('input', () => this.renderLogs());
        document.getElementById('filter-date').addEventListener('change', () => this.renderLogs());
        document.getElementById('clear-filters').addEventListener('click', () => {
            document.getElementById('search-name').value = '';
            document.getElementById('filter-date').value = '';
            this.renderLogs();
        });
    }

    handleScan() {
        const nameInput = document.getElementById('student-name');
        const uidInput = document.getElementById('rfid-uid');
        const typeInput = document.getElementById('scan-type');

        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        const newLog = {
            id: Date.now(),
            name: nameInput.value,
            uid: uidInput.value,
            date: now.toISOString().split('T')[0],
            day: days[now.getDay()],
            time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            status: typeInput.value
        };

        this.logs.unshift(newLog);
        this.saveLogs();
        this.renderLogs();
        this.updateStats();

        // Reset name only for next scan
        nameInput.value = '';
        this.generateNewUID(); // Simulate a new card for next time
        
        // Visual feedback
        const btn = document.getElementById('scan-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check-circle"></i> Scanned Successfully!';
        btn.style.background = 'var(--success)';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
        }, 2000);
    }

    generateNewUID() {
        const uid = 'SCN-' + Math.floor(1000 + Math.random() * 9000) + '-' + new Date().getFullYear();
        document.getElementById('rfid-uid').value = uid;
    }

    saveLogs() {
        localStorage.setItem('rfid_logs', JSON.stringify(this.logs));
    }

    renderLogs() {
        const tbody = document.getElementById('logs-body');
        const noData = document.getElementById('no-data');
        const searchName = document.getElementById('search-name').value.toLowerCase();
        const filterDate = document.getElementById('filter-date').value;

        const filteredLogs = this.logs.filter(log => {
            const matchesName = log.name.toLowerCase().includes(searchName);
            const matchesDate = !filterDate || log.date === filterDate;
            return matchesName && matchesDate;
        });

        tbody.innerHTML = '';
        
        if (filteredLogs.length === 0) {
            noData.style.display = 'block';
            return;
        }

        noData.style.display = 'none';

        filteredLogs.forEach(log => {
            const tr = document.createElement('tr');
            tr.className = 'animate-in';
            tr.innerHTML = `
                <td style="font-weight: 500;">${log.name}</td>
                <td style="font-family: monospace; color: var(--text-dim);">${log.uid}</td>
                <td>${log.date}</td>
                <td>${log.day}</td>
                <td>${log.time}</td>
                <td><span class="status-chip" style="${log.status === 'Check-Out' ? 'background: rgba(255, 77, 77, 0.1); color: #ff4d4d;' : ''}">${log.status}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }

    updateStats() {
        document.getElementById('total-scans').innerText = this.logs.length;
        
        const uniqueUsers = [...new Set(this.logs.map(log => log.uid))].length;
        document.getElementById('active-users').innerText = uniqueUsers;

        const today = new Date().toISOString().split('T')[0];
        const todayLogs = this.logs.filter(log => log.date === today);
        document.getElementById('today-presence').innerText = todayLogs.length;
    }

    startTimeDisplay() {
        const updateTime = () => {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
            document.getElementById('current-time-display').innerText = now.toLocaleDateString('en-US', options);
        };
        updateTime();
        setInterval(updateTime, 1000);
    }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AttendanceSystem();
});
