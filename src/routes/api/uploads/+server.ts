export const prerender = false;

import { json } from '@sveltejs/kit';
import { UploadService } from '../../../lib/server/services/upload.service';
import { HttpException } from '../../../lib/server/exceptions/http.exception';

const uploadService = new UploadService();

export async function POST({ request }) {
  try {
    const result = await uploadService.uploadFile(request);
    return json(result, { status: 201 });
  } catch (e) {
    if (e instanceof HttpException) {
      return json({ message: e.message }, { status: e.status });
    }
    return json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
