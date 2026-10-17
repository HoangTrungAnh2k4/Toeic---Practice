import { expect, test } from 'vitest';
import { presignUrl } from './r2';

// Ví dụ presigned URL trong tài liệu S3 SigV4 ("Authenticating Requests: Using Query Parameters")
test('presignUrl khớp ví dụ chính thức của AWS', () => {
    const url = presignUrl({
        method: 'GET',
        url: new URL('https://examplebucket.s3.amazonaws.com/test.txt'),
        accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
        secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        region: 'us-east-1',
        expiresSec: 86400,
        date: new Date('2013-05-24T00:00:00Z'),
    });
    expect(url).toContain('X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20130524%2Fus-east-1%2Fs3%2Faws4_request');
    expect(url).toMatch(/&X-Amz-Signature=aeeed9bbccd4d02ee5c0109b86d86835f995330da4c265957d157751f604d404$/);
});
