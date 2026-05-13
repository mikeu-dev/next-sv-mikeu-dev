<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xhtml="http://www.w3.org/1999/xhtml"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
    <xsl:template match="/">
        <html xmlns="http://www.w3.org/1999/xhtml">
            <head>
                <title>XML Sitemap</title>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                <style type="text/css">
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
                        color: #333;
                        margin: 0;
                        padding: 2rem;
                        background: #f4f7f6;
                    }
                    .container {
                        max-width: 1200px;
                        margin: 0 auto;
                        background: #fff;
                        padding: 2rem;
                        border-radius: 12px;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                    }
                    h1 {
                        color: #1a1a1a;
                        font-size: 2rem;
                        margin-bottom: 0.5rem;
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                    }
                    p.description {
                        color: #666;
                        margin-bottom: 2rem;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 1rem;
                        table-layout: fixed;
                    }
                    th {
                        text-align: left;
                        padding: 12px;
                        background: #f8fafc;
                        border-bottom: 2px solid #edf2f7;
                        color: #4a5568;
                        font-weight: 600;
                        text-transform: uppercase;
                        font-size: 0.75rem;
                        letter-spacing: 0.05em;
                    }
                    th:nth-child(1) { width: 35%; }
                    th:nth-child(2) { width: 40%; }
                    th:nth-child(3) { width: 15%; }
                    th:nth-child(4) { width: 10%; }
                    td {
                        padding: 12px;
                        border-bottom: 1px solid #edf2f7;
                        font-size: 0.85rem;
                        vertical-align: top;
                        word-break: break-word;
                        overflow-wrap: break-word;
                    }
                    tr:hover td {
                        background: #fcfdfe;
                    }
                    a {
                        color: #3182ce;
                        text-decoration: none;
                    }
                    a:hover {
                        text-decoration: underline;
                    }
                    .priority-high { color: #e53e3e; font-weight: 600; }
                    .priority-mid { color: #38a169; }
                    .priority-low { color: #718096; }
                    .footer {
                        margin-top: 2rem;
                        font-size: 0.8rem;
                        color: #a0aec0;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>XML Sitemap</h1>
                    <p class="description">
                        This is an XML Sitemap, meant for consumption by search engines like Google or Bing.<br/>
                        You can find more information about XML sitemaps on <a href="https://sitemaps.org">sitemaps.org</a>.
                    </p>
                    <table>
                        <thead>
                            <tr>
                                <th>URL</th>
                                <th>Alternates</th>
                                <th>Change Freq</th>
                                <th>Priority</th>
                            </tr>
                        </thead>
                        <tbody>
                            <xsl:for-each select="sitemap:urlset/sitemap:url">
                                <tr>
                                    <td>
                                        <xsl:variable name="itemURL">
                                            <xsl:value-of select="sitemap:loc"/>
                                        </xsl:variable>
                                        <a href="{$itemURL}">
                                            <xsl:value-of select="sitemap:loc"/>
                                        </a>
                                    </td>
                                    <td>
                                        <xsl:for-each select="xhtml:link">
                                            <div style="font-size: 0.8rem; margin-bottom: 4px;">
                                                <span style="color: #a0aec0; width: 90px; display: inline-block;">
                                                    <xsl:value-of select="@hreflang"/>:
                                                </span>
                                                <a href="{@href}" style="color: #718096;">
                                                    <xsl:value-of select="@href"/>
                                                </a>
                                            </div>
                                        </xsl:for-each>
                                    </td>
                                    <td>
                                        <xsl:value-of select="sitemap:changefreq"/>
                                    </td>
                                    <td>
                                        <xsl:variable name="priority">
                                            <xsl:value-of select="sitemap:priority"/>
                                        </xsl:variable>
                                        <span>
                                            <xsl:attribute name="class">
                                                <xsl:choose>
                                                    <xsl:when test="$priority &gt;= 0.8">priority-high</xsl:when>
                                                    <xsl:when test="$priority &gt;= 0.5">priority-mid</xsl:when>
                                                    <xsl:otherwise>priority-low</xsl:otherwise>
                                                </xsl:choose>
                                            </xsl:attribute>
                                            <xsl:value-of select="sitemap:priority"/>
                                        </span>
                                    </td>
                                </tr>
                            </xsl:for-each>
                        </tbody>
                    </table>
                    <div class="footer">
                        Generated by Mikeudev Sitemap Engine
                    </div>
                </div>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
