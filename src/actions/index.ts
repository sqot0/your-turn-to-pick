import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://lpqlaccnbzhcmzeuygys.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwcWxhY2NuYnpoY216ZXV5Z3lzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTU4ODU4MiwiZXhwIjoyMDQ1MTY0NTgyfQ.DVwY0_Tb-EVMLD1fkdB3-p2Bjnwd1wFe-xop4VFA7oA');

async function uploadFile(file: File) {
    try {
        const fileName = file.name;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('main')
            .upload(fileName, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from('main')
            .createSignedUrl(uploadData.path, 99999999);

        await supabase
            .from('files')
            .insert({ name: fileName, url: signedUrlData.signedUrl });

        return signedUrlData;
    } catch (error) {
        return null;
    }
}

export async function getFiles() {
    const { data, error } = await supabase.from('files').select('*');
    if (error) {
        console.error('Error fetching files:', error);
        return null;
    }
    return data;
}

export const server = {
    uploadFile: defineAction({
        accept: 'form',
        input: z.object({
            file: z.instanceof(File),
        }),
        handler: async (input) => {
            const response = await uploadFile(input.file);
            return response;
        }
    }),
};