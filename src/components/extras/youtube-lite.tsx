import { type LiteYouTubeProps } from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import LiteYouTubeEmbed from "react-lite-youtube-embed";

function YoutubeLite(props: LiteYouTubeProps) {
	return <LiteYouTubeEmbed {...props} />;
}

export default YoutubeLite;
