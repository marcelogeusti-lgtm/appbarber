const fs = require('fs');
const path = require('path');

const manifest = {
    barbershops: [],
    professionals: [],
    services: [],
    appointments: [],
    users: [],
    authUsers: []
};

const shopIds = new Set();
const proIds = new Set();
const apptIds = new Set();
const userIds = new Set();
const authIds = new Set();

function addShop(s) {
    if (s && s.id && !shopIds.has(s.id)) {
        manifest.barbershops.push(s);
        shopIds.add(s.id);
    }
}

function addPro(p) {
    if (p && p.id && !proIds.has(p.id)) {
        manifest.professionals.push(p);
        proIds.add(p.id);
    }
}

function addAppt(a) {
    if (a && a.id && !apptIds.has(a.id)) {
        manifest.appointments.push(a);
        apptIds.add(a.id);
    }
}

console.log('--- STARTING COMPREHENSIVE CONSOLIDATION ---');

const serverDir = 'server';
const files = fs.readdirSync(serverDir, { recursive: true });

files.forEach(f => {
    const fullPath = path.join(serverDir, f);
    if (!fs.statSync(fullPath).isFile()) return;
    if (!(f.endsWith('.txt') || f.endsWith('.log') || f.endsWith('.json'))) return;

    console.log(`Processing ${f}...`);
    const content = fs.readFileSync(fullPath, 'utf8');

    // Pattern 1: JSON structures
    if (f.endsWith('.json')) {
        try {
            const data = JSON.parse(content);
            const arr = Array.isArray(data) ? data : [data];
            arr.forEach(item => {
                if (item.id && (item.date || item.status)) {
                    addAppt(item);
                    if (item.barbershop) addShop(item.barbershop);
                    if (item.professional) addPro(item.professional);
                    if (item.service) { /* maybe add services later */ }
                }
                if (item.id && (item.nickname !== undefined || item.role === 'ADMIN')) {
                    if (!userIds.has(item.id)) {
                        manifest.users.push(item);
                        userIds.add(item.id);
                    }
                    if (item.authUser && !authIds.has(item.authUser.id)) {
                        manifest.authUsers.push(item.authUser);
                        authIds.add(item.authUser.id);
                    }
                    if (item.professionalProfile) addPro({ ...item.professionalProfile, userId: item.id });
                }
            });
        } catch (e) {}
    }

    // Pattern 2: "ID: [uuid]" with context
    const matches = content.matchAll(/ID: ([a-z0-9-]{36})/gi);
    for (const m of matches) {
        const id = m[1].toLowerCase();
        const start = Math.max(0, m.index - 60);
        const context = content.substring(start, m.index + 120).replace(/\n/g, ' ');
        
        if (context.includes('App') || context.includes('Agendam') || context.includes('date') || context.includes('Status')) {
            addAppt({ id, _context: context.trim() });
        } else if (context.includes('Shop') || context.includes('Barbearia')) {
            addShop({ id, _context: context.trim() });
        } else if (context.includes('Pro') || context.includes('Barbeiro')) {
            addPro({ id, _context: context.trim() });
        }
    }

    // Pattern 3: Brute force UUIDs for appointments if in diagnostic file
    if (f.includes('diagnostic') || f.includes('marcelo')) {
        const bruteMatches = content.match(/[a-z0-9-]{36}/gi);
        if (bruteMatches) {
            bruteMatches.forEach(id => {
                if (!shopIds.has(id.toLowerCase()) && !proIds.has(id.toLowerCase())) {
                    addAppt({ id: id.toLowerCase(), _source: f });
                }
            });
        }
    }
});

fs.writeFileSync('server/reconstruction_manifest.json', JSON.stringify(manifest, null, 2));
console.log('Final Manifest Stats:');
console.log('- Barbershops:', manifest.barbershops.length);
console.log('- Professionals:', manifest.professionals.length);
console.log('- Appointments:', manifest.appointments.length);
console.log('- Users:', manifest.users.length);
