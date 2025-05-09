const Reels = require('../models/Reels');
const User = require('../models/User');
const ReelEpisodes = require('../models/ReelEpisodes');
const Ads = require('../models/Ads');
const Category = require('../models/Category');
exports.monthlyReport = async (req, res) => {
    try {
        // Helper to get month name
        const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        // Aggregate Users by month/year
        const usersByMonth = await User.aggregate([
            { $match: { role: 'User' } },
            {
                $group: {
                    _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                    totalNumberOfUser: { $sum: 1 }
                }
            }
        ]);

        // Aggregate Reels by month/year
        const reelsByMonth = await Reels.aggregate([
            { $match: { status: 'approved' } },
            {
                $group: {
                    _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                    totalNumberOfReels: { $sum: 1 }
                }
            }
        ]);

        // Aggregate Episodes by month/year
        const episodesByMonth = await ReelEpisodes.aggregate([
            { $match: { status: 'approved' } },
            {
                $group: {
                    _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                    totalNumberOfEpisodes: { $sum: 1 }
                }
            }
        ]);

        // Aggregate Ads by month/year
        const adsByMonth = await Ads.aggregate([
            {
                $group: {
                    _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                    totalNumberOfAds: { $sum: 1 }
                }
            }
        ]);

        // Merge all months
        const allMonths = new Set([
            ...usersByMonth.map(u => `${u._id.year}-${u._id.month}`),
            ...reelsByMonth.map(r => `${r._id.year}-${r._id.month}`),
            ...episodesByMonth.map(e => `${e._id.year}-${e._id.month}`),
            ...adsByMonth.map(a => `${a._id.year}-${a._id.month}`)
        ]);

        const report = Array.from(allMonths).map(key => {
            const [year, month] = key.split('-').map(Number);
            const user = usersByMonth.find(u => u._id.year === year && u._id.month === month);
            const reel = reelsByMonth.find(r => r._id.year === year && r._id.month === month);
            const episode = episodesByMonth.find(e => e._id.year === year && e._id.month === month);
            const ad = adsByMonth.find(a => a._id.year === year && a._id.month === month);
            return {
                month: `${monthNames[month - 1]}`,
                totalNumberOfUser: user ? user.totalNumberOfUser : 0,
                totalNumberOfVideos: (reel ? reel.totalNumberOfReels : 0) + (episode ? episode.totalNumberOfEpisodes : 0),
                totalNumberOfAds: ad ? ad.totalNumberOfAds : 0
            };
        });

        // Sort by year and month descending
        report.sort((a, b) => {
            const [aMonth, aYear] = a.month.split(' ');
            const [bMonth, bYear] = b.month.split(' ');
            const aIdx = monthNames.indexOf(aMonth) + parseInt(aYear) * 12;
            const bIdx = monthNames.indexOf(bMonth) + parseInt(bYear) * 12;
            return bIdx - aIdx;
        });

        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.totalUsersVideosAdsCategories = async (req, res) => {
    try {
        const [
            totalUsers,
            totalAds,
            totalReels,
            totalEpisodes,
            totalCategories
        ] = await Promise.all([
            User.countDocuments({ role: 'User' }),
            Ads.countDocuments(),
            Reels.countDocuments({ status: 'approved' }),
            ReelEpisodes.countDocuments({ status: 'approved' }),
            Category.countDocuments()
        ]);

        res.status(200).json({
            totalUsers,
            totalAds,
            totalVideos: totalReels + totalEpisodes,
            totalCategories
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};





