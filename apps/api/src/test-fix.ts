import pdf from 'pdf-parse';
import * as fs from 'fs';

console.log('typeof pdf:', typeof pdf);

// Mock buffer to see if it's callable (it will fail inside but strictly we just want to see if TS complains about call signature)
// Actually we just want to compile it.
async function run() {
    try {
        // Just verify it is a function at runtime
        if (typeof pdf === 'function') {
            console.log('pdf is a function');
        } else {
            console.log('pdf is NOT a function, it is:', typeof pdf);
        }
    } catch (e) {
        console.error(e);
    }
}
run();
