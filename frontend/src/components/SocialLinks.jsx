// frontend/src/components/SocialLinks.jsx
import {
    FaGithub,
    FaLinkedin,
    FaGlobe,
    FaTwitter,
    FaYoutube,
    FaDiscord,
    FaTelegram
} from 'react-icons/fa';
import './SocialLinks.css';

function SocialLinks({
    github,
    linkedin,
    website,
    twitter,
    youtube,
    discord,
    telegram
}) {
    const links = [
        { icon: FaGithub, url: github, label: 'GitHub', color: '#333' },
        { icon: FaLinkedin, url: linkedin, label: 'LinkedIn', color: '#0A66C2' },
        { icon: FaGlobe, url: website, label: 'Website', color: '#6366f1' },
        { icon: FaTwitter, url: twitter, label: 'Twitter', color: '#1DA1F2' },
        { icon: FaYoutube, url: youtube, label: 'YouTube', color: '#FF0000' },
        { icon: FaDiscord, url: discord, label: 'Discord', color: '#5865F2' },
        { icon: FaTelegram, url: telegram, label: 'Telegram', color: '#0088cc' }
    ];

    const validLinks = links.filter(
        (link) => link.url && link.url.trim() !== ''
    );

    if (validLinks.length === 0) {
        return (
            <p className="no-social">
                No social profiles available.
            </p>
        );
    }

    return (
        <div className="social-links">
            {validLinks.map((link, index) => (
                <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                    title={link.label}
                    style={{ '--hover-color': link.color }}
                >
                    <link.icon />
                    <span>{link.label}</span>
                </a>
            ))}
        </div>
    );
}

export default SocialLinks;