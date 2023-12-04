export function formatComment(comment: string) {
  // strip html tags including content assuming any html is malicious
  const htmlPattern = /<([^</> ]+)[^<>]*?>[^<>]*?<\/\1>/g;
  let comment_ = comment.replace(htmlPattern, "");
  // strip custom pgn comments
  const customCommentPattern = /\[[^\]]+?\]/g;
  comment_ = comment_.replace(customCommentPattern, "");
  // unescape brackets
  comment_ = comment_.replaceAll("@@StartBracket@@", "(").replaceAll("@@EndBracket@@", ")");
  // remove fen information
  const fenPattern = /@@StartFEN@@[^@]+?@@EndFEN@@/g;
  comment_ = comment_.replaceAll(fenPattern, "");
  // highlight chess moves
  const chessMovePattern = /(([\d]{0,3}\.)?(\.{2,3})?[KQBNRP]?[a-h]?[1-8]?[x]?[a-h][1-8](=[NBRQK])?[+#]?)|0-0(-0)?/g;
  comment_ = comment_.replace(chessMovePattern, "<b>$1</b>");
  comment_ = comment_.trim();

  return comment_;
}
