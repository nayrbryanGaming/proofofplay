import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
    width: 32,
    height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 24,
                    background: 'black',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#4ade80', // green-400
                    border: '2px solid #14532d', // green-900
                    borderRadius: '4px',
                }}
            >
                ⚔️
            </div>
        ),
        {
            ...size,
        }
    );
}
